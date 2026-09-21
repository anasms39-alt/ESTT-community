import { baseLayout } from './layout';
import { emailStyles } from './styles';

/**
 * Global Announcement Email Template
 * @param {string} title - The title/heading of the announcement
 * @param {string} content - The main body text
 * @param {string} ctaLabel - Optional button label
 * @param {string} ctaLink - Optional button link
 * @param {string} coverImageUrl - Optional header image
 * @returns {string} - Full HTML email content
 */
export const globalAnnouncementEmail = (title, content, ctaLabel, ctaLink, coverImageUrl) => {
    // Process content to handle new lines as paragraphs
    const paragraphs = content.split('\n').filter(p => p.trim() !== '');
    const contentHtml = paragraphs.map(p => `<p style="${emailStyles.paragraph}">${p}</p>`).join('');

    const mainContent = `
       

        ${coverImageUrl ? `
        <div style="margin-bottom: 24px;">
            <img src="${coverImageUrl}" alt="Image de l'annonce" style="width: 100%; height: auto; border-radius: 12px; display: block; max-height: 320px; object-fit: cover;">
        </div>
        ` : ''}

        <h1 style="${emailStyles.h1}">${title}</h1>
        
        <div style="margin-bottom: 24px; color: #334155;">
            ${contentHtml}
        </div>
        
        ${ctaLabel && ctaLink ? `
        <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
            <a href="${ctaLink}" style="${emailStyles.button}">${ctaLabel}</a>
        </div>
        ` : ''}
        
        <p style="${emailStyles.paragraph}">
            Cordialement,<br>
            <strong>L'équipe ESTT-Community</strong>
        </p>

        <hr style="${emailStyles.divider}" />
        
       
    `;

    return baseLayout(mainContent);
};