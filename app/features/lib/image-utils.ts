// src/features/lib/image-utils.ts
export const getStaffImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return "/avatar-placeholder.png";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formattedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${backendUrl}${formattedPath}`;
};
