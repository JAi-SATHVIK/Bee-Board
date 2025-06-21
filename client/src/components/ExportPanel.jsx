import React from 'react';

function ExportPanel() {
  const handleExport = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    const canvasElem = document.getElementById('main-canvas');
    if (!canvasElem) {
      alert('Canvas not found!');
      return;
    }
    // Use html2canvas to capture the canvas area
    const canvas = await html2canvas(canvasElem, {backgroundColor: null, useCORS: true, scale: 2});
    const imgData = canvas.toDataURL('image/png');
    // Create a PDF with the same aspect ratio as the canvas
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('session-canvas.pdf');
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="bg-yellow rounded"
      style={{
        padding: '5px 13px',
        fontWeight: 700,
        color: '#111',
        fontSize: '0.93rem',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 2px 8px #ffd60033',
        cursor: 'pointer',
        minWidth: 0,
        minHeight: 0,
        margin: 0,
      }}
    >
      Export
    </button>
  );
}

export default ExportPanel; 