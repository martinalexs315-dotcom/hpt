export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo (5 Megabytes)

/**
 * Resizes and optimizes an image file up to 5 Mo so that:
 * 1. Files up to 5 Mo are accepted from user's smartphone or PC.
 * 2. If a file exceeds 5 Mo, it rejects with a clear French error message.
 * 3. The image is compressed into an optimized JPEG DataURL (max 1600px width/height, quality 0.82)
 *    so it is visually stunning and stays within Firestore document quotas.
 */
export async function processImageFile(file, maxDimension = 1600, quality = 0.82) {
  if (!file) return null;
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error(`Le fichier "${file.name || 'sélectionné'}" n'est pas une image valide.`);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMo = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`La photo "${file.name || 'sélectionnée'}" fait ${sizeMo} Mo et dépasse la limite maximale de 5 Mo.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier image.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de charger l'image."));
      img.onload = () => {
        try {
          let { width, height } = img;

          // If the image is large, scale down maintaining aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to JPEG with specified quality
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          // Fallback to original reader result if canvas fails
          resolve(reader.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
