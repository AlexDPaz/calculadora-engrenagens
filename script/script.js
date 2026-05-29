// Registra o Service Worker para habilitar o uso offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => { console.log('Modo offline ativado!', registration.scope); })
      .catch((error) => { console.log('Falha no modo offline:', error); });
  });
}

// Lógica Principal da Calculadora
let currentTab = 'retos';

function r(n, d = 2) { return isNaN(n) || !isFinite(n) ? '—' : Number(n.toFixed(d)); }
function v(id) { return parseFloat(document.getElementById(id).value) || 0; }

function switchTab(name) {
  currentTab = name;
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', ['retos', 'transmissao'][i] === name));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
}

function setResult(id, val) { const el = document.getElementById(id); if (el) el.textContent = val === '—' ? '—' : val; }

function calcRetos() {
  const M = v('modulo'), Z1 = v('z1'), Z2 = v('z2');
  const w1 = document.getElementById('w-modulo'), w2 = document.getElementById('w-z1');
  
  w1.textContent = M && M < 0.5 ? '⚠ módulo muito pequeno' : '';
  w2.textContent = Z1 && Z1 < 6 ? '⚠ mínimo recomendado: 6 dentes' : '';
  
  if (!M || !Z1) {
    ['dp1', 'de1', 'di1', 'h1', 's1', 'pr1', 'dp2', 'de2', 'di2', 'centros', 'relacao'].forEach(id => setResult(id, '—'));
    document.getElementById('coroa-results').style.display = 'none';
    document.getElementById('info-retos').textContent = '// preencha módulo e nº de dentes para ver os resultados';
    return;
  }
  
  const Dp1 = M * Z1, De1 = Dp1 + 2 * M, Di1 = Dp1 - 2.166 * M, h = 2.166 * M, S = 1.57 * M, Pr = M * Math.PI;
  setResult('dp1', r(Dp1)); setResult('de1', r(De1)); setResult('di1', r(Di1));
  setResult('h1', r(h)); setResult('s1', r(S)); setResult('pr1', r(Pr));

  let info = `Módulo ${M} — Z1=${Z1} dentes\nDp1=${r(Dp1)}mm  De1=${r(De1)}mm  h=${r(h)}mm`;
  
  if (Z2) {
    const Dp2 = M * Z2, De2 = Dp2 + 2 * M, Di2 = Dp2 - 2.166 * M, C = (Dp1 + Dp2) / 2, i = Z2 / Z1;
    setResult('dp2', r(Dp2)); setResult('de2', r(De2)); setResult('di2', r(Di2));
    setResult('centros', r(C)); setResult('relacao', r(i, 3));
    document.getElementById('coroa-results').style.display = 'block';
    info += `\nZ2=${Z2}  Dp2=${r(Dp2)}mm  C=${r(C)}mm  i=${r(i, 3)}`;
  } else {
    document.getElementById('coroa-results').style.display = 'none';
    setResult('relacao', '—');
  }
  document.getElementById('info-retos').textContent = '// ' + info;
}

function calcTransmissao() {
  const n1 = v('n1'), D1 = v('d1t'), D2 = v('d2t');
  const M = v('tm'), Z1 = v('tz1'), Z2 = v('tz2');
  
  if (n1 && D1 && D2 && D2 > 0) {
    const n2 = n1 * D1 / D2, i = D2 / D1;
    setResult('n2-out', r(n2, 1)); setResult('i-polias', r(i, 3));
  } else { 
    setResult('n2-out', '—'); setResult('i-polias', '—'); 
  }
  
  if (M && Z1) {
    const Dp1 = M * Z1, De1 = Dp1 + 2 * M;
    setResult('t-dp1', r(Dp1));
    if (Z2) {
      const Dp2 = M * Z2, De2 = Dp2 + 2 * M, C = (Dp1 + Dp2) / 2, i = Z2 / Z1;
      setResult('t-dp2', r(Dp2)); setResult('t-de', r(De1) + ' / ' + r(De2));
      setResult('t-c', r(C)); setResult('t-i', r(i, 3));
      const n2polias = n1 && D1 && D2 ? n1 * D1 / D2 : 0;
      const nFinal = n2polias ? n2polias / i : 0;
      setResult('t-nf', nFinal ? r(nFinal, 1) : '—');
    } else { 
      setResult('t-dp2', '—'); setResult('t-de', '—'); setResult('t-c', '—'); setResult('t-i', '—'); setResult('t-nf', '—'); 
    }
  } else { 
    ['t-dp1', 't-dp2', 't-de', 't-c', 't-i', 't-nf'].forEach(id => setResult(id, '—')); 
  }
}

function gerarMemorialPDF() {
  let htmlPdf = '';
  
  if (currentTab === 'retos') {
    const M = v('modulo'), Z1 = v('z1'), Z2 = v('z2');
    if (!M || !Z1) { alert('Insira os dados obrigatórios (Módulo e Z1) para gerar o relatório.'); return; }
    
    const Dp1 = M * Z1, De1 = Dp1 + 2 * M, Di1 = Dp1 - 2.166 * M, h = 2.166 * M, S = 1.57 * M, Pr = M * Math.PI;
    
    htmlPdf = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 25px; line-height: 1.6; background: #fff;">
        <div style="background-color: #1e3d59; color: white; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Memorial de Cálculo Técnico</h1>
          <p style="margin: 5px 0 0 0; color: #ffc107; font-size: 13px; font-weight: bold;">Engrenagens Cilíndricas de Dentes Retos (ECDR)</p>
        </div>
        
        <h2 style="color: #1e3d59; font-size: 15px; border-left: 4px solid #ffc107; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase;">1. Parâmetros de Entrada</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
          <tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Módulo (M)</td><td style="padding: 8px; border: 1px solid #dee2e6;">${M.toFixed(2)} mm</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Nº de Dentes do Pinhão (Z1)</td><td style="padding: 8px; border: 1px solid #dee2e6;">${Z1} dentes</td></tr>
          ${Z2 ? `<tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Nº de Dentes da Coroa (Z2)</td><td style="padding: 8px; border: 1px solid #dee2e6;">${Z2} dentes</td></tr>` : ''}
        </table>
        
        <h2 style="color: #1e3d59; font-size: 15px; border-left: 4px solid #ffc107; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase;">2. Geometria do Pinhão (Passo a Passo)</h2>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 2.1: Diâmetro Primitivo (Dp1)</strong><br>
          Fórmula: <i>Dp1 = M × Z1</i><br>
          Cálculo: ${M.toFixed(2)} × ${Z1} = <strong style="color:#0b5ed7;">${Dp1.toFixed(2)} mm</strong>
        </div>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 2.2: Diâmetro Externo (De1)</strong><br>
          Fórmula: <i>De1 = Dp1 + 2M</i><br>
          Cálculo: ${Dp1.toFixed(2)} + (2 × ${M.toFixed(2)}) = <strong style="color:#0b5ed7;">${De1.toFixed(2)} mm</strong>
        </div>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 2.3: Diâmetro Interno (Di1)</strong><br>
          Fórmula: <i>Di1 = Dp1 - 2.166M</i><br>
          Cálculo: ${Dp1.toFixed(2)} - (2.166 × ${M.toFixed(2)}) = <strong style="color:#0b5ed7;">${Di1.toFixed(2)} mm</strong>
        </div>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 2.4: Altura do Dente (h)</strong><br>
          Fórmula: <i>h = 2.166 × M</i><br>
          Cálculo: 2.166 × ${M.toFixed(2)} = <strong style="color:#0b5ed7;">${h.toFixed(2)} mm</strong>
        </div>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 2.5: Passo (Pr) e Espessura do dente (S)</strong><br>
          Passo Circular: <i>M × π</i> = ${M.toFixed(2)} × 3.1416 = <strong style="color:#0b5ed7;">${Pr.toFixed(2)} mm</strong><br>
          Espessura Nominal: <i>1.57 × M</i> = 1.57 × ${M.toFixed(2)} = <strong style="color:#0b5ed7;">${S.toFixed(2)} mm</strong>
        </div>
        
        ${Z2 ? `
        <h2 style="color: #1e3d59; font-size: 15px; border-left: 4px solid #ffc107; padding-left: 8px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase;">3. Geometria da Coroa e Par Acoplado</h2>
        <div style="background: #f5fbf7; border: 1px solid #e4f1e8; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 3.1: Diâmetro Primitivo da Coroa (Dp2)</strong><br>
          Cálculo: ${M.toFixed(2)} × ${Z2} = <strong style="color:#198754;">${(M*Z2).toFixed(2)} mm</strong>
        </div>
        <div style="background: #f5fbf7; border: 1px solid #e4f1e8; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 3.2: Relação de Transmissão Mecânica (i)</strong><br>
          Fórmula: <i>i = Z2 / Z1</i><br>
          Cálculo: ${Z2} / ${Z1} = <strong style="color:#198754;">${(Z2/Z1).toFixed(3)}</strong>
        </div>
        <div style="background: #f5fbf7; border: 1px solid #e4f1e8; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Passo 3.3: Distância de Montagem entre Centros (C)</strong><br>
          Fórmula: <i>C = (Dp1 + Dp2) / 2</i><br>
          Cálculo: (${Dp1.toFixed(2)} + ${(M*Z2).toFixed(2)}) / 2 = <strong style="color:#198754;">${((Dp1 + M*Z2)/2).toFixed(2)} mm</strong>
        </div>
        ` : ''}
      </div>
    `;
  } else {
    const n1 = v('n1'), D1 = v('d1t'), D2 = v('d2t'), M = v('tm'), Z1 = v('tz1'), Z2 = v('tz2');
    if (!n1 || !D1 || !D2) { alert('Insira os dados básicos do motor e polias para exportar.'); return; }
    
    const n2 = (n1 * D1) / D2;
    const iPolias = D2 / D1;
    
    let engrenagemHtml = '';
    if (M && Z1 && Z2) {
      const Dp1 = M * Z1, Dp2 = M * Z2, C = (Dp1 + Dp2) / 2, iEngr = Z2 / Z1, nFinal = n2 / iEngr;
      engrenagemHtml = `
        <h2 style="color: #1e3d59; font-size: 15px; border-left: 4px solid #ffc107; padding-left: 8px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase;">2. Segundo Estágio: Redução por Engrenagens</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px;">
          <tr style="background: #f8f9fa;"><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Módulo (M)</td><td style="padding: 8px; border: 1px solid #dee2e6;">${M} mm</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">Dentes Pinhão (Z1) / Coroa (Z2)</td><td style="padding: 8px; border: 1px solid #dee2e6;">${Z1} d / ${Z2} d</td></tr>
        </table>
        
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 10px; border-radius: 4px; font-size: 13px;">
          <strong style="color: #1e3d59;">Análise Dimensional:</strong><br>
          Dp1 (Pinhão) = ${M} × ${Z1} = <strong>${Dp1.toFixed(2)} mm</strong><br>
          Dp2 (Coroa) = ${M} × ${Z2} = <strong>${Dp2.toFixed(2)} mm</strong><br>
          Distância entre Centros Eixos (C) = <strong>${C.toFixed(2)} mm</strong>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #fd7e14; padding: 12px; border-radius: 0 4px 4px 0; font-size: 13px;">
          <strong style="color: #d94100;">Cinemática Final do Sistema:</strong><br>
          Relação de Transmissão do Par: <i>Z2 / Z1</i> = <strong>${iEngr.toFixed(3)}</strong><br>
          Rotação de Saída no Eixo da Coroa = ${n2.toFixed(1)} RPM / ${iEngr.toFixed(3)} = <strong style="font-size:14px; color:#b83200;">${nFinal.toFixed(1)} RPM</strong>
        </div>
      `;
    }
    
    htmlPdf = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 25px; line-height: 1.6; background: #fff;">
        <div style="background-color: #1e3d59; color: white; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Memorial de Sistema de Transmissão</h1>
          <p style="margin: 5px 0 0 0; color: #ffc107; font-size: 13px; font-weight: bold;">Análise Cinemática Combinada (Polias + Engrenagens)</p>
        </div>
        
        <h2 style="color: #1e3d59; font-size: 15px; border-left: 4px solid #ffc107; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase;">1. Primeiro Estágio: Redução por Polias</h2>
        <div style="background: #fdfbf7; border: 1px solid #f1ece4; padding: 12px; margin-bottom: 15px; border-radius: 4px; font-size: 13px;">
          <strong>Dados de Entrada:</strong> Rotação Motor (n1) = ${n1} RPM | D1 = ${D1} mm | D2 = ${D2} mm<br>
          <strong>Relação de Transmissão (Polias):</strong> <i>D2 / D1</i> = <strong>${iPolias.toFixed(3)}</strong><br>
          <strong>Rotação de Saída Intermediária (n2):</strong> <i>n1 × (D1/D2)</i> = <strong style="color:#0b5ed7;">${n2.toFixed(1)} RPM</strong>
        </div>
        ${engrenagemHtml}
      </div>
    `;
  }

  const opcoes = {
    margin:       15,
    filename:     'memorial_calculo_' + currentTab + '.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opcoes).from(htmlPdf).save();
}