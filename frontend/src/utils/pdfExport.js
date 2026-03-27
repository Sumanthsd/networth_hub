import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 7) {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addListSection(doc, section, startY) {
  let y = startY;
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.text(section.title, 16, y);
  y += 10;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  for (const item of section.items) {
    y = addWrappedText(doc, `- ${item}`, 20, y, 170);
    y += 2;
  }
  return y + 8;
}

function addTableSection(doc, section, startY) {
  let y = startY;
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.text(section.title, 16, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text(section.columns.join(' | '), 16, y);
  y += 7;

  doc.setFont('times', 'normal');
  for (const row of section.rows) {
    const line = row.map((value) => String(value || '-')).join(' | ');
    y = addWrappedText(doc, line, 16, y, 178, 6);
    y += 2;
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
  }

  return y + 8;
}

export function openPrintableReport(title, sections) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(title, 16, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Generated from NetWorth Hub', 16, y);
  doc.setTextColor(15, 23, 42);
  y += 12;

  for (const section of sections) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    y =
      section.type === 'table'
        ? addTableSection(doc, section, y)
        : addListSection(doc, section, y);
  }

  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

export async function openImageReport(title, items) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text(title, 16, y);
  y += 8;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Generated from NetWorth Hub', 16, y);
  doc.setTextColor(15, 23, 42);
  y += 12;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item?.element) continue;

    const canvas = await html2canvas(item.element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    const imageData = canvas.toDataURL('image/png');
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 32;
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;
    const ratio = imageHeight / imageWidth;
    const renderWidth = maxWidth;
    const renderHeight = renderWidth * ratio;

    if (y + 12 + renderHeight > 280) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.text(item.title, 16, y);
    y += 6;
    doc.addImage(imageData, 'PNG', 16, y, renderWidth, renderHeight);
    y += renderHeight + 10;
  }

  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
