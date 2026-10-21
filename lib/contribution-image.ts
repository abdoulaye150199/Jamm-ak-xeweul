export function getContributionImageError(image: unknown): string | null {
  if (image === undefined || image === null) return null;
  if (typeof image !== 'string') return 'Le fichier image est invalide.';
  if (image.length > 2_000_032) return 'L’image est trop volumineuse. La taille maximale est de 1,5 Mo.';
  const match = /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(image);
  if (!match || match[1].length % 4 !== 0) return 'Le format de l’image est invalide.';
  return Buffer.byteLength(match[1], 'base64') > 1_500_000
    ? 'L’image est trop volumineuse. La taille maximale est de 1,5 Mo.'
    : null;
}
