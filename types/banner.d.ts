export interface Image {
  url: string;
  width: number;
  height: number;

}

export interface BannerData {
  id: number;
  Header: string;
  Subheader?: string | null;
  CTA: string;
  url: string;
  image: Image;
}