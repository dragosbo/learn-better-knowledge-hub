import { jsPDF } from 'jspdf';
import { YouTubeClip, SummaryData } from '../types';

export interface PdfExportOptions {
  scope: 'current' | 'playlist';
  playlistTitle?: string;
  includeSummary: boolean;
  includeNotes: boolean;
  includeQuestions: boolean;
  includeIdeas: boolean;
}

// Clean text to standard Latin characters for standard jsPDF fonts
function cleanTextForPdf(str: string): string {
  if (!str) return '';
  return str
    .replace(/[💡🚀📝✨🧠🎯📌🔥⚡]/g, '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

export function generateAcademicNotebookPdf(
  clips: YouTubeClip[],
  summaries: SummaryData[],
  options: PdfExportOptions
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 14;
  const rightMargin = 196;
  const marginLineX = 35; // Ruled vertical margin guide
  const contentStartX = 39;
  const contentWidth = rightMargin - contentStartX;
  const bottomThreshold = 265;
  const lineSpacingMm = 7.5;

  // Draws notebook background, horizontal rules and vertical margin guide
  const drawNotebookRules = () => {
    // Subtle warm paper background
    doc.setFillColor(252, 252, 250);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Horizontal faint ruled lines
    doc.setDrawColor(230, 235, 240);
    doc.setLineWidth(0.12);
    for (let y = 30; y < 275; y += lineSpacingMm) {
      doc.line(leftMargin, y, rightMargin, y);
    }

    // Vertical margin line (classic academic Cornell / lab notebook red line)
    doc.setDrawColor(239, 68, 68); // Soft red
    doc.setLineWidth(0.3);
    doc.line(marginLineX, 16, marginLineX, 280);

    // Subtle second margin track line
    doc.setDrawColor(254, 202, 202);
    doc.setLineWidth(0.1);
    doc.line(marginLineX + 0.8, 16, marginLineX + 0.8, 280);
  };

  let currentPage = 1;
  drawNotebookRules();

  const checkPageBreak = (neededHeight: number): number => {
    if (currentY + neededHeight > bottomThreshold) {
      doc.addPage();
      currentPage++;
      drawNotebookRules();
      drawPageHeader();
      return 36;
    }
    return currentY;
  };

  let activeClipTitle = '';

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('ACADEMIC STUDY NOTEBOOK', leftMargin, 12);
    const rightHeader = options.playlistTitle 
      ? `PLAYLIST: ${cleanTextForPdf(options.playlistTitle).toUpperCase().slice(0, 45)}`
      : cleanTextForPdf(activeClipTitle).toUpperCase().slice(0, 45);
    doc.text(rightHeader, rightMargin, 12, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, 14, rightMargin, 14);
  };

  let currentY = 32;

  // Process clips
  clips.forEach((clip, clipIndex) => {
    activeClipTitle = clip.title;

    if (clipIndex > 0) {
      doc.addPage();
      currentPage++;
      drawNotebookRules();
      currentY = 32;
    }

    drawPageHeader();

    const matchingSummary = summaries.find(s => s.videoId === clip.id);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Left Margin: Date and Clip Index
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28); // Dark red / Crimson
    doc.text(`[0${clipIndex + 1}]`, leftMargin, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(dateStr, leftMargin, currentY + 4);

    // Main Column: Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // Slate 900
    const titleLines = doc.splitTextToSize(cleanTextForPdf(clip.title), contentWidth);
    doc.text(titleLines, contentStartX, currentY);
    currentY += titleLines.length * 5.5 + 2;

    // Sub-header metadata (Channel, Status, Tags)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const metaText = `Channel: ${cleanTextForPdf(clip.channel)}   |   Status: ${clip.status.toUpperCase()}   |   ID: ${clip.id}`;
    doc.text(metaText, contentStartX, currentY);
    currentY += 4.5;

    if (clip.tags && clip.tags.length > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(99, 102, 241); // Indigo
      const tagsText = clip.tags.map(t => `#${cleanTextForPdf(t).toLowerCase()}`).join('  ');
      doc.text(tagsText, contentStartX, currentY);
      currentY += 5;
    }

    // Divider after clip header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(contentStartX, currentY, rightMargin, currentY);
    currentY += 6;

    // SECTION 1: Summary & Key Takeaways
    if (options.includeSummary) {
      currentY = checkPageBreak(25);

      // Margin cue
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(79, 70, 229); // Indigo
      doc.text('KEY TAKEAWAY', leftMargin, currentY + 1);

      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Key Takeaway & Core Thesis', contentStartX, currentY);
      currentY += 5;

      const takeawayText = matchingSummary?.oneLineTakeaway 
        || clip.summary 
        || 'Key insights extracted directly via Learn-Better Personal Knowledge Hub.';
      
      // Highlighted takeaway box in main area
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const takeawayLines = doc.splitTextToSize(`"${cleanTextForPdf(takeawayText)}"`, contentWidth - 4);
      
      const boxHeight = takeawayLines.length * 4.5 + 4;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(contentStartX, currentY - 3, contentWidth, boxHeight, 1.5, 1.5, 'F');
      
      doc.text(takeawayLines, contentStartX + 3, currentY + 1);
      currentY += boxHeight + 5;

      // If full content is available and not too huge, show structured points
      if (matchingSummary?.topic || matchingSummary?.audience) {
        currentY = checkPageBreak(12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const metaDetails = [
          matchingSummary.topic ? `Focus: ${cleanTextForPdf(matchingSummary.topic)}` : '',
          matchingSummary.audience ? `Target: ${cleanTextForPdf(matchingSummary.audience)}` : ''
        ].filter(Boolean).join('   |   ');
        if (metaDetails) {
          doc.text(metaDetails, contentStartX, currentY);
          currentY += 5;
        }
      }
    }

    // SECTION 2: Personal Study Notes & Reflections
    if (options.includeNotes) {
      currentY = checkPageBreak(25);

      // Margin cue
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9); // Amber 700
      doc.text('STUDY NOTES', leftMargin, currentY + 1);

      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Personal Notes & Conceptual Reflections', contentStartX, currentY);
      currentY += 5;

      const notesText = clip.notes && clip.notes.trim().length > 0 
        ? clip.notes 
        : '(No personal notes recorded yet for this clip. Keep this space ruled for physical handwritten annotations.)';
      
      const isPlaceholder = !clip.notes || clip.notes.trim().length === 0;

      doc.setFont('helvetica', isPlaceholder ? 'italic' : 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(isPlaceholder ? 148 : 30, isPlaceholder ? 163 : 41, isPlaceholder ? 184 : 59);

      const paragraphs = cleanTextForPdf(notesText).split('\n');
      for (const para of paragraphs) {
        if (!para.trim()) {
          currentY += 3;
          continue;
        }
        const wrappedLines = doc.splitTextToSize(para.trim(), contentWidth);
        for (const line of wrappedLines) {
          currentY = checkPageBreak(6);
          doc.text(line, contentStartX, currentY);
          currentY += 4.5;
        }
      }

      if (clip.voiceReflections && clip.voiceReflections.length > 0) {
        for (const vr of clip.voiceReflections) {
          currentY = checkPageBreak(25);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(225, 29, 72); // Rose
          doc.text('VOICE DEBRIEF', leftMargin, currentY + 1);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`Spoken Socratic Reflection (${cleanTextForPdf(vr.date)})`, contentStartX, currentY);
          currentY += 4.5;

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const debriefLines = doc.splitTextToSize(`"${cleanTextForPdf(vr.synthesis.oneLineSummary)}"`, contentWidth);
          doc.text(debriefLines, contentStartX, currentY);
          currentY += debriefLines.length * 4 + 3;
        }
      }

      currentY += 4;
    }

    // SECTION 3: Questions & Inquiries Checklist
    if (options.includeQuestions) {
      currentY = checkPageBreak(25);

      // Margin cue
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(2, 132, 199); // Sky / Blue
      doc.text('INQUIRIES', leftMargin, currentY + 1);

      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Open Questions & Verification Checklist', contentStartX, currentY);
      currentY += 5;

      const questions = clip.userQuestions && clip.userQuestions.length > 0
        ? clip.userQuestions
        : [
            'What are the core technical assumptions made in this demonstration?',
            'How can this concept be applied or stress-tested in personal projects?',
            'What potential failure modes or edge cases were left unaddressed?'
          ];

      questions.forEach((q) => {
        const cleanedQ = cleanTextForPdf(q);
        const qLines = doc.splitTextToSize(cleanedQ, contentWidth - 8);
        currentY = checkPageBreak(qLines.length * 4.5 + 4);

        // Draw checkbox square
        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.25);
        doc.rect(contentStartX, currentY - 2.8, 3.2, 3.2);

        // Question text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(qLines, contentStartX + 6, currentY);
        currentY += qLines.length * 4.5 + 2.5;
      });
      currentY += 3;
    }

    // SECTION 4: AI Prompts & Vibe Coding Ideas
    if (options.includeIdeas) {
      currentY = checkPageBreak(25);

      // Margin cue
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text('AI PROMPTS', leftMargin, currentY + 1);

      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Prompts, Experiments & Implementation Ideas', contentStartX, currentY);
      currentY += 5;

      const ideas = clip.userIdeas && clip.userIdeas.length > 0
        ? clip.userIdeas
        : [
            'Draft an architectural scaffold applying the core design pattern highlighted in this video.',
            'Create a rapid prototype in Vite + React to benchmark performance characteristics.'
          ];

      ideas.forEach((idea, idx) => {
        const cleanedIdea = cleanTextForPdf(idea);
        const ideaLines = doc.splitTextToSize(cleanedIdea, contentWidth - 8);
        currentY = checkPageBreak(ideaLines.length * 4.5 + 4);

        // Bullet marker
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129);
        doc.text(`[${idx + 1}]`, contentStartX, currentY);

        // Idea text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(ideaLines, contentStartX + 6, currentY);
        currentY += ideaLines.length * 4.5 + 2.5;
      });
      currentY += 6;
    }
  });

  // Second pass: Draw page numbers and running footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, 284, rightMargin, 284);

    doc.text('Learn-Better Knowledge Hub  |  Academic Notebook Series', leftMargin, 289);
    doc.text(`Page ${i} of ${totalPages}`, rightMargin, 289, { align: 'right' });
  }

  // File download name
  let filename = 'study_notes_notebook.pdf';
  if (options.scope === 'current' && clips.length === 1) {
    const sanitizedTitle = clips[0].title
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 35);
    filename = `notebook_${sanitizedTitle}.pdf`;
  } else if (options.playlistTitle) {
    const sanitizedPl = options.playlistTitle
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 35);
    filename = `playlist_digest_${sanitizedPl}.pdf`;
  }

  doc.save(filename);
}
