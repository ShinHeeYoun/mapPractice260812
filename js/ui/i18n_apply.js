import { i18n } from '../config/i18n.js';

export function applyI18n() {
    // APP_LANG is set globally in index.jsp
    const lang = window.APP_LANG || 'en';
    const dict = i18n[lang];
    
    if (!dict) return; // Fallback to raw HTML if invalid lang

    // Translate standard text nodes
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Translate placeholders
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            input.setAttribute('placeholder', dict[key]);
        }
    });
}
