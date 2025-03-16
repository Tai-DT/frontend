import jsPDF from 'jspdf';
import { OrderInfo } from '../types/payment';
import { formatDate, formatNumber } from './utils';
import html2canvas from 'html2canvas';

/**
 * Generates order receipt PDF with Vietnamese support using HTML2Canvas
 */
export const generateOrderPdf = async (orderInfo: OrderInfo): Promise<void> => {
  if (!orderInfo) return;
  
  try {
    // Create a temporary div to render the receipt
    const receiptDiv = document.createElement('div');
    receiptDiv.style.position = 'absolute';
    receiptDiv.style.left = '-9999px';
    receiptDiv.style.fontFamily = 'Arial, sans-serif';
    receiptDiv.style.width = '595px'; // A4 width in pixels at 72 dpi
    receiptDiv.style.padding = '40px';
    
    // Format the receipt HTML with proper Vietnamese characters
    receiptDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">CHI TIẾT ĐƠN HÀNG</h1>
        <p>Ngày đặt: ${formatDate(new Date())}</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <p><strong>Mã đơn hàng:</strong> ${orderInfo.orderCode}</p>
        <p><strong>Trạng thái:</strong> ${
          orderInfo.paymentStatus === 'SUCCESS' ? 'Đã thanh toán' : 
          orderInfo.paymentStatus === 'PENDING' ? 'Đang chờ thanh toán' : 
          'Chưa thanh toán'
        }</p>
        <p><strong>Phương thức thanh toán:</strong> ${
          orderInfo.paymentMethod === 'bank' ? 
          'Chuyển khoản ngân hàng' : 
          'Thanh toán khi nhận hàng (COD)'
        }</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
      
      <div style="margin-bottom: 15px;">
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Thông tin khách hàng:</h2>
        <p>Họ tên: ${orderInfo.buyerName}</p>
        <p>Số điện thoại: ${orderInfo.buyerPhone}</p>
        ${orderInfo.buyerEmail ? `<p>Email: ${orderInfo.buyerEmail}</p>` : ''}
        <p>Địa chỉ: ${orderInfo.buyerAddress}</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
      
      <div style="margin-bottom: 15px;">
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Sản phẩm:</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="font-weight: bold;">
            <td style="padding: 8px 5px;">Sản phẩm</td>
            <td style="padding: 8px 5px; text-align: center;">SL</td>
            <td style="padding: 8px 5px; text-align: right;">Đơn giá</td>
          </tr>
          
          ${orderInfo.transactions.items.map(item => `
            <tr style="border-top: 1px solid #eee;">
              <td style="padding: 8px 5px;">${item.name}</td>
              <td style="padding: 8px 5px; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px 5px; text-align: right;">${formatNumber(item.price)} VND</td>
            </tr>
          `).join('')}
          
          <tr style="border-top: 1px solid #ddd; font-weight: bold;">
            <td colspan="2" style="padding: 8px 5px; text-align: right;">Tổng cộng:</td>
            <td style="padding: 8px 5px; text-align: right;">${formatNumber(orderInfo.amount)} VND</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 40px; text-align: center;">
        <p style="font-weight: bold;">Cảm ơn quý khách đã mua hàng!</p>
        <p>Mọi thắc mắc xin vui lòng liên hệ hotline: 0123.456.789</p>
      </div>
    `;
    
    // Add the div to the document
    document.body.appendChild(receiptDiv);
    
    // Use html2canvas to render the receipt as an image
    const canvas = await html2canvas(receiptDiv, {
      scale: 1.5, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    
    // Save the PDF
    pdf.save(`Order-${orderInfo.orderCode}.pdf`);
    
    // Clean up the temporary div
    document.body.removeChild(receiptDiv);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to simpler method if html2canvas fails
    fallbackGenerateOrderPdf(orderInfo);
  }
};

/**
 * Fallback method that uses basic jsPDF text without Vietnamese diacritics
 * Only used if the HTML2Canvas method fails
 */
const fallbackGenerateOrderPdf = (orderInfo: OrderInfo): void => {
  if (!orderInfo) return;
  
  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });
    
    // Remove diacritics from Vietnamese text for compatibility
    const convertVietnamese = (text: string): string => {
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    };
    
    // Set up document dimensions
    const pageWidth = 210;
    const margin = 20;
    
    // Helper function to add text with positioning
    const addText = (text: string, y: number, options: {
      fontSize?: number;
      align?: 'left' | 'center' | 'right';
      isBold?: boolean;
    } = {}) => {
      const { fontSize = 10, align = 'left', isBold = false } = options;
      const compatibleText = convertVietnamese(text);
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (align === 'center') {
        pdf.text(compatibleText, pageWidth / 2, y, { align: 'center' });
      } else if (align === 'right') {
        pdf.text(compatibleText, pageWidth - margin, y, { align: 'right' });
      } else {
        pdf.text(compatibleText, margin, y);
      }
    };
    
    // Helper to draw lines
    const drawLine = (y: number) => {
      pdf.setDrawColor(200);
      pdf.line(margin, y, pageWidth - margin, y);
    };
    
    // Add content (using simplified non-diacritic text)
    addText('CHI TIET DON HANG', 30, { fontSize: 16, align: 'center', isBold: true });
    addText(`Ngay dat: ${formatDate(new Date())}`, 38, { align: 'center' });
    
    // Order info
    let yPosition = 50;
    addText(`Ma don hang: ${orderInfo.orderCode}`, yPosition, { isBold: true });
    yPosition += 7;
    
    // Payment status
    const paymentStatus = orderInfo.paymentStatus === 'SUCCESS' ? 'Da thanh toan' : 
                         orderInfo.paymentStatus === 'PENDING' ? 'Dang cho thanh toan' : 
                         'Chua thanh toan';
    addText(`Trang thai: ${paymentStatus}`, yPosition);
    yPosition += 7;
    
    // Payment method
    const paymentMethod = orderInfo.paymentMethod === 'bank' ? 
                         'Chuyen khoan ngan hang' : 
                         'Thanh toan khi nhan hang (COD)';
    addText(`Phuong thuc thanh toan: ${paymentMethod}`, yPosition);
    yPosition += 10;
    
    // Draw line
    drawLine(yPosition);
    yPosition += 10;
    
    // Customer info
    addText('Thong tin khach hang:', yPosition, { isBold: true });
    yPosition += 7;
    addText(`Ho ten: ${orderInfo.buyerName}`, yPosition);
    yPosition += 7;
    addText(`So dien thoai: ${orderInfo.buyerPhone}`, yPosition);
    yPosition += 7;
    if (orderInfo.buyerEmail) {
      addText(`Email: ${orderInfo.buyerEmail}`, yPosition);
      yPosition += 7;
    }
    addText(`Dia chi: ${orderInfo.buyerAddress}`, yPosition);
    yPosition += 10;
    
    // Draw line
    drawLine(yPosition);
    yPosition += 10;
    
    // Products table
    addText('San pham:', yPosition, { isBold: true });
    yPosition += 10;
    
    // Table headers
    pdf.setFont('helvetica', 'bold');
    addText('San pham', yPosition);
    addText('SL', yPosition, { align: 'center' });
    addText('Don gia', yPosition, { align: 'right' });
    yPosition += 7;
    
    // Draw line
    drawLine(yPosition);
    yPosition += 7;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    orderInfo.transactions.items.forEach(item => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Truncate name if too long
      const name = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      
      addText(name, yPosition);
      addText(item.quantity.toString(), yPosition, { align: 'center' });
      addText(`${formatNumber(item.price)} VND`, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    // Draw line
    drawLine(yPosition);
    yPosition += 7;
    
    // Total
    addText('Tong cong:', yPosition, { align: 'right', isBold: true });
    yPosition += 7;
    addText(`${formatNumber(orderInfo.amount)} VND`, yPosition, { align: 'right', isBold: true });
    yPosition += 20;
    
    // Footer
    addText('Cam on quy khach da mua hang!', yPosition, { align: 'center', isBold: true });
    yPosition += 7;
    addText('Moi thac mac xin vui long lien he hotline: 076.842.6262', yPosition, { align: 'center' });
    
    // Save the PDF
    pdf.save(`Order-${orderInfo.orderCode}.pdf`);
    
  } catch (error) {
    console.error('Error generating fallback PDF:', error);
  }
};

// Legacy methods are kept for reference but not used by default
export const generateOrderPdfWithBase64Font = (orderInfo: OrderInfo): void => {
  if (!orderInfo) return;
  
  try {
    const pdf = new jsPDF();
    
    // Đây là ví dụ về cách thêm font từ base64
    // Trong thực tế, bạn cần tạo biến chứa dữ liệu base64 của font Roboto hoặc font Unicode khác
    // Ví dụ: import { ROBOTO_REGULAR_BASE64 } from './fonts';
    const SAMPLE_FONT_BASE64 = "AAABAAAA..."; // Thay bằng chuỗi base64 của font thật
    
    pdf.addFileToVFS('Roboto-Regular.ttf', SAMPLE_FONT_BASE64);
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.setFont('Roboto');
    
    // Tiếp tục code tạo PDF...
    
    pdf.save(`Order-${orderInfo.orderCode}.pdf`);
  } catch (error) {
    console.error('Error generating PDF with base64 font:', error);
  }
};

/**
 * Phương pháp 3: Sử dụng SVG thay vì text để hiển thị tiếng Việt
 * Giải pháp này phức tạp hơn nhưng đảm bảo hiển thị đúng tiếng Việt
 */
export const generateOrderPdfWithSVG = (orderInfo: OrderInfo): void => {
  if (!orderInfo) return;
  
  try {
    const pdf = new jsPDF();
    
    // Hàm để tạo SVG text
    const createSVGText = (text: string, fontSize: number = 10) => {
      return `<svg width="200" height="30">
        <text x="0" y="20" font-family="Arial" font-size="${fontSize}px">${text}</text>
      </svg>`;
    };
    
    // Thêm SVG text vào PDF
    const addSVGText = (text: string, x: number, y: number, fontSize: number = 10) => {
      const svg = createSVGText(text, fontSize);
      pdf.addSvgAsImage(svg, x, y, 100, 10);
    };
    
    // Sử dụng SVG để hiển thị tiếng Việt
    addSVGText('CHI TIẾT ĐƠN HÀNG', 50, 30, 16);
    // Tiếp tục tạo các phần khác bằng SVG...
    
    pdf.save(`Order-${orderInfo.orderCode}.pdf`);
  } catch (error) {
    console.error('Error generating PDF with SVG:', error);
  }
};

/**
 * Phương pháp 4: Sử dụng html2canvas + jsPDF
 * Đây là giải pháp phức tạp nhất nhưng đảm bảo hiển thị đúng
 */
export const generateOrderPdfFromHTML = async (orderInfo: OrderInfo): Promise<void> => {
  if (!orderInfo) return;
  
  try {
    // Giả sử bạn đã import html2canvas
    // import html2canvas from 'html2canvas';
    
    // Cách triển khai:
    // 1. Tạo một div ẩn chứa nội dung HTML có định dạng giống PDF
    // 2. Sử dụng html2canvas để chuyển đổi div thành canvas
    // 3. Chuyển đổi canvas thành hình ảnh và thêm vào PDF
    
    // Ví dụ code:
    /*
    const element = document.getElementById('receipt-container');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Order-${orderInfo.orderCode}.pdf`);
    */
    
    // Thực tế triển khai phụ thuộc vào cấu trúc ứng dụng của bạn
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
  }
};