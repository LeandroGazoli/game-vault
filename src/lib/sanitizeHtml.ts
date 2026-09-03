import DOMPurify from "isomorphic-dompurify";

export function sanitizeCustomHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  const clean = DOMPurify.sanitize(dirtyHtml, {
    FORCE_BODY: true,
    ALLOWED_TAGS: [
      "div", "span", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "b", "i", "strong", "em", "u", "s", "strike", "del", "mark",
      "ul", "ol", "li", "dl", "dt", "dd",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "img", "a", "br", "hr", "blockquote", "code", "pre",
      "figure", "figcaption", "center", "marquee", "details", "summary",
      "sub", "sup", "small", "big", "font", "style", "title",
      "section", "article", "aside", "header", "footer", "main", "nav",
      "video", "audio", "source",
      // Elementos Interativos e Controles Solicitados
      "button", "input", "label", "select", "option", "textarea",
      // Tags Gráficas SVG
      "svg", "path", "circle", "rect", "polygon", "polyline", "line",
      "g", "defs", "linearGradient", "radialGradient", "stop", "mask",
      "pattern", "clipPath", "use", "symbol", "text", "tspan"
    ],
    ALLOWED_ATTR: [
      "style", "class", "src", "href", "alt", "title", "target", "rel",
      "width", "height", "align", "valign", "color", "face", "size",
      "border", "cellspacing", "cellpadding", "colspan", "rowspan", "id",
      "controls", "autoplay", "loop", "muted", "poster", "preload",
      // Atributos de Inputs, Radios e Botões
      "type", "name", "value", "checked", "placeholder", "for", "disabled", "readonly", "required",
      // Atributos SVG
      "viewBox", "d", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
      "stroke-dasharray", "stroke-dashoffset", "transform", "x", "y", "x1", "y1", "x2", "y2",
      "cx", "cy", "r", "rx", "ry", "points", "xmlns", "xmlns:xlink", "xlink:href",
      "opacity", "fill-opacity", "stroke-opacity", "offset", "stop-color", "stop-opacity"
    ],
    FORBID_TAGS: [
      "script", "iframe", "object", "embed", "form", "link", "meta",
      "base", "applet", "frame", "frameset"
    ],
    FORBID_ATTR: [
      "onload", "onerror", "onclick", "onmouseover", "onmouseout",
      "onfocus", "onblur", "onchange", "onsubmit", "onkeydown",
      "onkeyup", "onkeypress", "onmouseenter", "onmouseleave",
      "oncontextmenu", "ondblclick", "onwheel", "onscroll"
    ],
    ADD_DATA_URI_TAGS: ["img", "video", "audio", "source", "style"],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: true,
    ADD_ATTR: ["target"],
  });

  return clean;
}

/**
 * Identifica se um conteúdo foi escrito puramente como HTML/CSS estruturado
 * para evitar que o parser de Markdown envolva elementos em tags <p> ou quebre layouts.
 */
export function isPureHtmlBio(content?: string | null): boolean {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  return /^\s*<(style|div|section|main|article|table|svg|button|header|footer|nav|aside|input)/i.test(trimmed);
}

