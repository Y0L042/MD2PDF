const { Plugin } = require('obsidian');

module.exports = class MdToPdfPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'convert-to-pdf',
      name: 'Convert Markdown to PDF',
      callback: () => this.convertToPdf()
    });
  }

  async convertToPdf() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file to convert.');
      return;
    }

    const markdown = await this.app.vault.read(activeFile);
    const pdfBuffer = await this.convertMarkdownToPdf(markdown);

    if (pdfBuffer) {
      const pdfFile = `${activeFile.basename}.pdf`;
      const pdfFilePath = `${this.app.vault.adapter.basePath}/${pdfFile}`;
      require('fs').writeFileSync(pdfFilePath, pdfBuffer);
      new Notice(`PDF created: ${pdfFile}`);
    }
  }

  async convertMarkdownToPdf(markdown) {
    try {
      const response = await fetch('https://md-to-pdf.fly.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ markdown })
      });

      if (!response.ok) {
        new Notice('Failed to convert markdown to PDF.');
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      new Notice('Error converting markdown to PDF.');
      console.error(error);
      return null;
    }
  }
};
