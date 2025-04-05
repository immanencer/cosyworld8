#!/usr/bin/env node

/**
 * Documentation Builder Script
 * 
 * This script builds HTML documentation from markdown files using markdown-it.
 * It preserves the directory structure and adds navigation.
 * It includes Mermaid diagram support and fixes relative links.
 * It also creates a combined markdown file for LLM ingestion.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import markdownIt from 'markdown-it';
import { glob } from 'glob';

// Setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');
const buildDir = path.join(__dirname, '..', 'dist', 'docs');
const combinedMdPath = path.join(buildDir, 'cosyworld-docs-combined.md');

// Initialize markdown-it with options
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Basic HTML template
const htmlTemplate = (title, content, navigation) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - CosyWorld Documentation</title>
  <!-- Mermaid script for diagram rendering -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose'
      });
    });
  </script>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
    }
    nav {
      width: 250px;
      padding-right: 2rem;
      flex-shrink: 0;
    }
    main {
      flex-grow: 1;
    }
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
      font-size: 85%;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 5px;
      overflow: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    nav ul { list-style-type: none; padding-left: 1.2em; }
    nav > ul { padding-left: 0; }
    .section-title { 
      font-weight: bold; 
      margin-top: 1em;
      color: #24292e;
    }
    /* Mermaid diagram styling */
    .mermaid {
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <nav>${navigation}</nav>
  <main>${content}</main>
</body>
</html>
`;

// Function to get the base path for relative links
function getRelativeBasePath(filePath) {
  const relativePath = path.relative(buildDir, path.dirname(filePath));
  if (relativePath === '') return './';
  
  // Count the number of directory levels and create a path with the right number of "../"
  const levels = relativePath.split(path.sep).length;
  return '../'.repeat(levels);
}

// Function to build navigation with fixed relative paths
async function buildNavigation(currentFilePath = null) {
  // Define the sections and their directories
  const sections = [
    { title: 'Overview', dir: 'overview' },
    { title: 'Systems', dir: 'systems' },
    { title: 'Services', dir: 'services' },
    { title: 'Deployment', dir: 'deployment' }
  ];
  
  // Get base path for relative links
  const basePath = currentFilePath ? getRelativeBasePath(currentFilePath) : '';
  
  let nav = '<ul>';
  nav += `<li><a href="${basePath}index.html">Home</a></li>`;
  
  for (const section of sections) {
    nav += `<li><span class="section-title">${section.title}</span><ul>`;
    
    // Process root files for each section
    const files = glob.sync(`${docsDir}/${section.dir}/*.md`);
    for (const file of files) {
      const fileName = path.basename(file);
      const fileNameWithoutExt = fileName.replace('.md', '');
      const fileContent = await fs.readFile(file, 'utf8');
      const title = fileContent.split('\n')[0].replace('# ', '').trim();
      const outputPath = `${basePath}${section.dir}/${fileNameWithoutExt}.html`;
      
      nav += `<li><a href="${outputPath}">${title}</a></li>`;
    }
    
    // For services, add subdirectories
    if (section.dir === 'services') {
      const serviceTypes = glob.sync(`${docsDir}/${section.dir}/*/`, { mark: true });
      
      for (const serviceType of serviceTypes) {
        const typeDir = path.basename(serviceType.replace(/\/$/, ''));
        if (typeDir === 'build') continue;  // Skip the build directory
        
        // Extract a cleaner section title from directory name
        const sectionTitle = typeDir.charAt(0).toUpperCase() + typeDir.slice(1);
        nav += `<li><span class="section-title">${sectionTitle}</span><ul>`;
        
        // Get all MD files in this service type directory
        const serviceFiles = glob.sync(`${serviceType}*.md`);
        for (const file of serviceFiles) {
          const fileName = path.basename(file);
          const fileNameWithoutExt = fileName.replace('.md', '');
          const fileContent = await fs.readFile(file, 'utf8');
          const title = fileContent.split('\n')[0].replace('# ', '').trim();
          
          // Fixed path - using direct path structure to avoid services/services
          const outputPath = `${basePath}services/${typeDir}/${fileNameWithoutExt}.html`;
          
          nav += `<li><a href="${outputPath}">${title}</a></li>`;
        }
        
        nav += '</ul></li>';
      }
    }
    
    nav += '</ul></li>';
  }
  
  nav += '</ul>';
  return nav;
}

// Function to transform Markdown content for proper diagram rendering and fixed relative links
function transformMarkdown(markdown, filePath) {
  // Convert mermaid code blocks to div elements
  let transformedMarkdown = markdown.replace(/```mermaid([\s\S]*?)```/g, '<div class="mermaid">$1</div>');
  
  // Fix relative links to other markdown files in the same directory
  transformedMarkdown = transformedMarkdown.replace(/\[([^\]]+)\]\(([^)]+)\.md\)/g, (match, text, link) => {
    // Only process relative links, not absolute URLs
    if (link.startsWith('http') || link.startsWith('#')) {
      return match;
    }
    
    // Check if it's a relative path with directory traversal
    if (link.startsWith('../')) {
      // Handle parent directory links
      const baseDir = path.dirname(path.relative(docsDir, filePath));
      const targetPath = path.resolve(path.dirname(filePath), link);
      const relativePath = path.relative(docsDir, targetPath);
      const htmlLink = relativePath.replace('.md', '.html');
      const basePath = getRelativeBasePath(filePath);
      return `[${text}](${basePath}${htmlLink})`;
    }
    
    // Handle links in the same directory
    return `[${text}](${link}.html)`;
  });
  
  return transformedMarkdown;
}

// Function to generate combined markdown file for LLM ingestion
async function generateCombinedMarkdown(markdownFiles) {
  console.log('Generating combined markdown file for LLM ingestion...');
  
  let combinedContent = '# CosyWorld Documentation\n\n';
  combinedContent += 'This document contains all documentation for the CosyWorld project.\n\n';
  combinedContent += '## Table of Contents\n\n';
  
  // Create a table of contents
  for (const section of ['Overview', 'Systems', 'Services', 'Deployment']) {
    combinedContent += `### ${section}\n\n`;
    
    const sectionFiles = markdownFiles.filter(file => {
      const relativePath = path.relative(docsDir, file);
      return relativePath.startsWith(section.toLowerCase() + '/') || 
             (section === 'Services' && relativePath.startsWith('services/'));
    });
    
    for (const file of sectionFiles) {
      const fileContent = await fs.readFile(file, 'utf8');
      const title = fileContent.split('\n')[0].replace('# ', '').trim();
      const relativePath = path.relative(docsDir, file);
      combinedContent += `- [${title}](#${title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')})\n`;
    }
    
    combinedContent += '\n';
  }
  
  // Add all content
  for (const file of markdownFiles) {
    const fileContent = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(docsDir, file);
    
    combinedContent += `\n\n## Document: ${relativePath}\n\n`;
    combinedContent += fileContent.replace(/^# /, '## ').replace(/^## /gm, '### ').replace(/^### /gm, '#### ');
    combinedContent += '\n\n---\n\n';
  }
  
  await fs.writeFile(combinedMdPath, combinedContent);
  console.log(`Generated combined markdown file at ${path.relative(docsDir, combinedMdPath)}`);
}

// Function to fix any path issues in the HTML
function fixPathIssues(html) {
  // Fix "services/services/" paths that might occur in nested navigation
  return html.replace(/services\/services\//g, 'services/');
}

// Main build function
async function buildDocs() {
  console.log('Building documentation...');
  
  // Create build directory if it doesn't exist
  await fs.mkdir(buildDir, { recursive: true });
  
  // Process all markdown files in docs directory and subdirectories
  const markdownFiles = glob.sync(`${docsDir}/**/*.md`);
  
  // Generate the combined markdown file for LLM ingestion
  await generateCombinedMarkdown(markdownFiles);
  
  // Build the main index navigation (without a specific path)
  const mainNavigation = await buildNavigation();
  
  // Copy the main README as index.html
  const mainReadme = await fs.readFile(path.join(docsDir, 'index.md'), 'utf8');
  const mainContent = md.render(transformMarkdown(mainReadme, path.join(docsDir, 'index.md')));
  let indexHtml = htmlTemplate('Home', mainContent, mainNavigation);
  // Fix any path issues
  indexHtml = fixPathIssues(indexHtml);
  await fs.writeFile(path.join(buildDir, 'index.html'), indexHtml);
  
  // Process each markdown file to HTML
  for (const file of markdownFiles) {
    // Skip the main README as we've already processed it
    if (file === path.join(docsDir, 'README.md')) continue;
    
    const relativePath = path.relative(docsDir, file);
    const outputPath = path.join(buildDir, relativePath.replace('.md', '.html'));
    const outputDir = path.dirname(outputPath);
    
    // Create the output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Read the markdown file
    const markdown = await fs.readFile(file, 'utf8');
    
    // Transform markdown for proper diagram rendering and fixed links
    const transformedMarkdown = transformMarkdown(markdown, file);
    
    // Build navigation with proper relative paths for this specific file
    const navigation = await buildNavigation(outputPath);
    
    // Render the markdown to HTML
    const content = md.render(transformedMarkdown);
    
    // Extract the title from the first h1
    const title = markdown.split('\n')[0].replace('# ', '').trim();
    
    // Generate the HTML
    let html = htmlTemplate(title, content, navigation);
    
    // Fix any path issues before writing
    html = fixPathIssues(html);
    
    // Write the HTML file
    await fs.writeFile(outputPath, html);
    console.log(`Converted ${relativePath} to ${path.relative(docsDir, outputPath)}`);
  }
  
  console.log('Documentation built successfully!');
}

// Run the build
buildDocs().catch(err => {
  console.error('Error building documentation:', err);
  process.exit(1);
});