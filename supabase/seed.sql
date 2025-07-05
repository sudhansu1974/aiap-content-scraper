-- Sample data for scraped_data table
INSERT INTO public.scraped_data (
  id, 
  url, 
  title, 
  headings, 
  links, 
  screenshot, 
  issues, 
  created_at
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'https://example.com',
  'Example Domain',
  '[
    {"tag": "h1", "text": "Example Domain"},
    {"tag": "h2", "text": "This domain is for use in illustrative examples"}
  ]',
  '[
    {"href": "https://www.iana.org/domains/example", "text": "More information", "isBroken": false},
    {"href": "https://www.example.org", "text": "Example.org", "isBroken": false},
    {"href": "https://www.example.net", "text": "Example.net", "isBroken": false}
  ]',
  'https://yoursupabasestorage.com/screenshots/example-screenshot.png',
  '[
    {"type": "info", "description": "Page has a simple structure with minimal content"},
    {"type": "warning", "description": "Missing meta description tag"}
  ]',
  NOW() - INTERVAL '2 days'
);

INSERT INTO public.scraped_data (
  id, 
  url, 
  title, 
  headings, 
  links, 
  screenshot, 
  issues, 
  created_at
) VALUES (
  '223e4567-e89b-12d3-a456-426614174001',
  'https://mozilla.org',
  'Mozilla: Internet for people, not profit',
  '[
    {"tag": "h1", "text": "Mozilla"},
    {"tag": "h2", "text": "Internet for people, not profit"},
    {"tag": "h3", "text": "Products"},
    {"tag": "h3", "text": "Innovation"}
  ]',
  '[
    {"href": "https://www.mozilla.org/firefox/", "text": "Firefox", "isBroken": false},
    {"href": "https://www.mozilla.org/firefox/new/", "text": "Download Firefox", "isBroken": false},
    {"href": "https://www.mozilla.org/about/", "text": "About Mozilla", "isBroken": false},
    {"href": "https://blog.mozilla.org/", "text": "Mozilla Blog", "isBroken": false},
    {"href": "https://broken-link.example.com", "text": "Broken Link", "isBroken": true}
  ]',
  'https://yoursupabasestorage.com/screenshots/mozilla-screenshot.png',
  '[
    {"type": "info", "description": "Good page structure with proper heading hierarchy"},
    {"type": "error", "description": "Contains 1 broken link"},
    {"type": "warning", "description": "Some images missing alt text"}
  ]',
  NOW() - INTERVAL '1 day'
); 