const fs = require('fs');
const path = require('path');

const pages = [
  'Gallery.tsx', 'Blog.tsx', 'BlogPost.tsx', 'Testimonials.tsx', 'FAQ.tsx', 'Careers.tsx', 'Franchise.tsx'
];

const dir = path.join(__dirname, 'frontend/src/pages');

pages.forEach(page => {
  const filePath = path.join(dir, page);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has useNavigate imported
  if (content.includes('useNavigate')) {
    console.log(`Skipping ${page} (already has useNavigate)`);
    return;
  }

  // Add imports
  let newContent = content.replace(/(import React.*?;\n)/, `$1import { useNavigate } from 'react-router-dom';\nimport { ArrowLeft } from 'lucide-react';\n`);
  
  // Add navigate hook
  newContent = newContent.replace(/(const \w+(?:[: ]+React\.FC)? = \([^)]*\) => {\n)/, `$1  const navigate = useNavigate();\n\n`);
  
  // Add back button before h1 or inside the first div
  const backBtn = `
      <button 
        onClick={() => navigate(-1)}
        className="group mb-8 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
        Back
      </button>
`;
  
  newContent = newContent.replace(/(<div[^>]*>)\n(\s*<h1)/, `$1${backBtn}$2`);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Patched ${page}`);
});
