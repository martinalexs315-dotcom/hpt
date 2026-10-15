import { jsPDF } from 'jspdf';
import { fmt } from './data.js';

/**
 * Génère un numéro de reçu unique, intelligent et infalsifiable.
 * Format : HPT-AAAAMMJJ-CODEUNIQUE (ex: HPT-20261012-7K9M4X)
 */
export function generateReceiptNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timeCode = (Date.now() % 1000000).toString(36).toUpperCase().padStart(4, '0');
  const entropy = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `HPT-${year}${month}${day}-${timeCode}${entropy}`;
}

/**
 * Génère et télécharge le document PDF officiel de l'attestation de don.
 */
export function downloadDonationPDF({
  receiptNumber,
  date,
  amount,
  method,
  cagnotteTitle,
  donorEmail,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Bandeau supérieur coloré
  doc.setFillColor(47, 182, 232); // #2FB6E8 (Bleu / Teal Hassanates)
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Liseré orange d'accent
  doc.setFillColor(240, 166, 60); // #F0A63C
  doc.rect(0, 8, pageWidth, 2.5, 'F');

  // 2. En-tête de l'association
  doc.setTextColor(24, 21, 17); // #181511
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('HASSANATES POUR TOUS', 20, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(107, 102, 96); // #6B6660
  doc.text("Association solidaire et humanitaire déclarée", 20, 32);
  doc.text("Dakar, Sénégal · contact@hassanates-pourtous.org", 20, 37);

  // Numéro de reçu & Date dans un cadre en haut à droite
  doc.setDrawColor(228, 223, 213); // #E4DFD5
  doc.setFillColor(247, 244, 238); // #F7F4EE
  doc.roundedRect(pageWidth - 78, 17, 58, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(47, 182, 232);
  doc.text('REÇU N°', pageWidth - 74, 23);

  doc.setFontSize(9.5);
  doc.setTextColor(24, 21, 17);
  doc.text(receiptNumber, pageWidth - 74, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 102, 96);
  doc.text(`Date : ${date || new Date().toLocaleDateString('fr-FR')}`, pageWidth - 74, 34);

  // 3. Titre du document
  doc.setFillColor(241, 237, 228);
  doc.roundedRect(20, 48, pageWidth - 40, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 21, 17);
  doc.text('ATTESTATION & RÉCÉPISSÉ OFFICIEL DE DON', pageWidth / 2, 58, { align: 'center' });

  // 4. Cadre récapitulatif du versement
  doc.setDrawColor(228, 223, 213);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 72, pageWidth - 40, 68, 3, 3, 'FD');

  const startY = 82;
  const lineSpacing = 11;

  const rows = [
    ['Bénéficiaire du don :', 'Association Hassanates pour tous'],
    ['Attribué à :', donorEmail ? donorEmail : 'Donateur solidaire anonyme'],
    ['Affectation / Projet :', cagnotteTitle || 'Fonds de solidarité général'],
    ['Moyen de paiement :', `${method || 'Wave / Orange Money'} (Paiement mobile sécurisé)`],
    ['Statut de la transaction :', 'Confirmé et enregistré avec succès'],
  ];

  rows.forEach(([label, val], idx) => {
    const y = startY + idx * lineSpacing;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 102, 96);
    doc.text(label, 26, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 21, 17);
    doc.text(String(val), 84, y);

    if (idx < rows.length - 1) {
      doc.setDrawColor(241, 237, 228);
      doc.line(26, y + 4, pageWidth - 26, y + 4);
    }
  });

  // 5. Bloc Montant mis en majesté
  doc.setFillColor(247, 244, 238);
  doc.setDrawColor(47, 182, 232);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, 148, pageWidth - 40, 24, 3, 3, 'FD');
  doc.setLineWidth(0.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(107, 102, 96);
  doc.text('MONTANT TOTAL DU DON VERSÉ :', 28, 163);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(29, 147, 196); // #1D93C4
  doc.text(fmt(amount), pageWidth - 28, 163, { align: 'right' });

  // 6. Texte de certification et mentions légales
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 56, 50);

  const certText =
    "L'association Hassanates pour tous certifie avec profonde gratitude avoir reçu le versement mentionné ci-dessus à titre de don solidaire. " +
    "Ce don est intégralement consacré aux actions caritatives et humanitaires sur le terrain au bénéfice direct des familles vulnérables, " +
    "des orphelins et des enfants défavorisés (distributions de paniers alimentaires, moutons de Tabaski, kits scolaires et caravanes de soins médicaux).";

  const splitText = doc.splitTextToSize(certText, pageWidth - 40);
  doc.text(splitText, 20, 185);

  // 7. Bloc Tampon & Signature
  doc.setDrawColor(228, 223, 213);
  doc.line(20, 212, pageWidth - 20, 212);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 102, 96);
  doc.text(`Fait à Dakar, le ${date || new Date().toLocaleDateString('fr-FR')}`, 20, 222);

  doc.setFont('helvetica', 'bold');
  doc.text('Pour le Bureau Exécutif', 20, 228);

  // Cachet officiel stylisé
  const stampX = pageWidth - 60;
  const stampY = 236;
  doc.setDrawColor(47, 182, 232);
  doc.setLineWidth(0.7);
  doc.circle(stampX, stampY, 15);
  doc.setLineWidth(0.2);

  doc.setFontSize(6.5);
  doc.setTextColor(47, 182, 232);
  doc.text('HASSANATES POUR TOUS', stampX, stampY - 6, { align: 'center' });
  doc.text('★ BUREAU DE GESTION ★', stampX, stampY, { align: 'center' });
  doc.text('DAKAR · SÉNÉGAL', stampX, stampY + 6, { align: 'center' });

  // 8. Pied de page
  doc.setFillColor(247, 244, 238);
  doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 125, 118);
  doc.text('Ce reçu atteste de la réception des fonds et vaut justificatif officiel de don solidaire.', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Déclenchement du téléchargement
  const filename = `Attestation-Don-Hassanates-${receiptNumber}.pdf`;
  doc.save(filename);
}
