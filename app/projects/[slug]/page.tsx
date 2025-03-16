import React from "react";
import Image from "next/image";
import { ProjectData } from "@/types/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { getStrapiImageUrl } from '@/lib/imageUrl'; // Import your utility function
import { Metadata } from 'next';
type ProjectResponse = {
  data: ProjectData[];
};

async function fetchProjectBySlug(slug: string): Promise<ProjectData | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/projects?filters[slug][$eq]=${slug}&populate[0]=image&populate[1]=details&populate[2]=details.image`;
    const response = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = (await response.json()) as ProjectResponse;
    return data.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await fetchProjectBySlug(resolvedParams.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project page does not exist',
      robots: 'noindex, nofollow'
    };
  }
  
  // Better image handling with null checks and default
  let mainImage = '/default-project-og.jpg';
  if (project.image && project.image.length > 0 && project.image[0].url) {
    mainImage = getStrapiImageUrl(project.image[0].url) || mainImage;
  }
  
  // Use optional chaining consistently
  return {
    title: project.seo?.metaTitle || project.name,
    description: project.seo?.metaDescription || project.description?.substring(0, 160),
    keywords: project.seo?.keywords || project.name,
    alternates: {
      canonical: project.seo?.canonical || `/projects/${project.slug}`
    },
    robots: project.seo?.metaRobots || 'index, follow',
    openGraph: {
      title: project.seo?.shareTitle || project.seo?.metaTitle || project.name,
      description: project.seo?.shareDescription || project.seo?.metaDescription || project.description?.substring(0, 160),
      images: [{
        url: mainImage,
        width: 1200,
        height: 630,
        alt: project.image?.[0]?.alternativeText || project.name
      }],
      type: 'article',
      locale: 'vi_VN',
      siteName: 'Audio Tailoc'
    },
    twitter: {
      card: 'summary_large_image',
      title: project.seo?.metaTitle || project.name,
      description: project.seo?.metaDescription || project.description?.substring(0, 160),
      images: [mainImage]
    }
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

const ProjectDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  const project = await fetchProjectBySlug(slug);

  if (!project) {
    notFound();
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <p className="text-gray-600">Không thể tải thông tin dự án. Vui lòng thử lại sau.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const id_youtube_video = project?.id_youtube_video || '';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": project.name,
    "description": project.description,
    "image": project.image?.map(img => getStrapiImageUrl(img.url)),
    "datePublished": project.publishedAt || new Date().toISOString(),
    "dateModified": project.updatedAt || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Audio Tailoc"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Audio Tailoc",
      "logo": {
        "@type": "ImageObject",
        "url": "https://audio-tailoc.com/logo.png"
      }
    },
    ...(project.seo?.structuredData || {})
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Hero section with enhanced header */}
        <div className="text-center mb-8">
          {/* Enhanced H1 with better semantics */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Dự án: {project.name}
          </h1>
          
          <p className="text-lg text-gray-600">{project.description}</p>
          
          {/* Add publication date for better SEO */}
          {project.publishedAt && (
            <p className="text-sm text-gray-500 mt-2">
              Ngày thực hiện: {new Date(project.publishedAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Rest of your existing image gallery and project details code */}
        {project.image && project.image.length > 0 && (
          <Card className="mb-8 overflow-hidden border-0 shadow-lg">
            <div className="relative aspect-video">
              <Image
                src={getStrapiImageUrl(project.image[0].url) || "/placeholder-project-detail.png"}
                alt={project.name}
                fill
                priority={true} // Added priority for LCP improvement
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          </Card>
        )}

        {project.price && (
          <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge variant="secondary" className="px-6 py-2 text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(project.price)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {project.perks && project.perks.description && project.perks.text && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{project.perks.text}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{project.perks.description}</p>
              </CardContent>
            </Card>
          )}

          {project.details && project.details.length > 0 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center mb-8">Chi Tiết</h2>
              <div className="grid gap-8 md:grid-cols-2">
                {project.details.map((detail) => (
                  <Card key={detail.id} className="overflow-hidden border-0 shadow-lg">
                    {detail.image && detail.image.url && (
                      <div className="relative aspect-video">
                        <Image
                          src={getStrapiImageUrl(detail.image.url) || "/placeholder-project-detail-item.png"} // Use getStrapiImageUrl and placeholder
                          alt={detail.name || 'Project Detail Image'}
                          fill
                          className="object-cover"
                          sizes="100%" // Added sizes for responsiveness
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{detail.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{detail.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {id_youtube_video && id_youtube_video.trim() !== '' && (
            <div className="mt-12">
              <Separator className="mb-12" />
              <h2 className="text-3xl font-bold text-center mb-8">Video Dự Án</h2>
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${id_youtube_video}?autoplay=0&controls=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

export default ProjectDetailPage;