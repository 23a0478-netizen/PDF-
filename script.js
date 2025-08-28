const $ = (id)=>document.getElementById(id);

function parseLinesOrComma(text) {
  return text.split(/\r?\n|,|、/).map(s=>s.trim()).filter(s=>s);
}

function escapeHTML(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderPreview() {
  const title = $('inputTitle').value;
  const songs = parseLinesOrComma($('inputSongs').value);
  const numPref = Math.max(1, Math.min(20, parseInt($('inputNumPref').value || 6)));
  const checks = parseLinesOrComma($('inputChecks').value);
  const showRemarks = $('inputRemarksDisplay').value === 'yes'; // 追加: 備考表示の判定

  const container = $('pdf-content');
  container.innerHTML = '';

  // --- タイトル ---
  const header = document.createElement('div');
  header.className = 'title-row';
  header.innerHTML = `
    <div class="big-title">${escapeHTML(title)}</div>
    <div style="font-size:15px; text-align:center;">
      <div style="border-bottom:1px solid #000; padding-bottom:4px; margin-bottom:6px; font-size:25px;">　年　 　 組　　 番</div>
      <div style="width:250px; height:35px; border:1px solid #222; display:inline-block;"></div>
    </div>
  `;
  container.appendChild(header);
  const hr = document.createElement('hr');
  hr.className = 'divider';
  container.appendChild(hr);

  // --- 1. 希望する曲 ---
  const s1t = document.createElement('div');
  s1t.className = 'section-title';
  s1t.textContent = '1. 希望する曲を教えてください';
  container.appendChild(s1t);

  const choices = document.createElement('div');
  choices.className = 'choices';
  choices.innerHTML = `<strong>選択肢：</strong> ${escapeHTML(songs.join('、'))}`;
  container.appendChild(choices);

  const table = document.createElement('table');
  table.className = 'pref-table outer';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th style="width:80px;"></th>
    <th class="pref-col-song">曲</th>
    <th class="pref-col-taiko">太鼓</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (let i=0;i<numPref;i++){
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.className='pref-left-label';
    tdLabel.textContent = `第${i+1}希望`;
    const tdSong = document.createElement('td');
    tdSong.className='pref-col-song';
    tdSong.innerHTML = '&nbsp;';
    const tdTaiko = document.createElement('td');
    tdTaiko.className='pref-col-taiko';
    tdTaiko.innerHTML = '&nbsp;';
    tr.appendChild(tdLabel);
    tr.appendChild(tdSong);
    tr.appendChild(tdTaiko);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  // --- 2. チェック項目 ---
  if (checks.length > 0) { // 追加: 空なら表示しない
    const s2t = document.createElement('div');
    s2t.className = 'section-title';
    s2t.textContent = '2. やりたいものがあったら✓をつけてください';
    container.appendChild(s2t);

    const checkList = document.createElement('div');
    checkList.className = 'check-list';
    checks.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'check-item';
      row.innerHTML = `<div style="width:16px;height:16px;border:1px solid #222;"></div><div>${escapeHTML(item)}</div>`;
      checkList.appendChild(row);
    });
    container.appendChild(checkList);
  }

  // --- 3. その他備考 ---
  if (showRemarks) { // 追加: 選択式
    const s3t = document.createElement('div');
    s3t.className = 'section-title';
    s3t.textContent = '3. その他備考';
    container.appendChild(s3t);

    const remarks = document.createElement('div');
    remarks.className = 'remarks-box';
    container.appendChild(remarks);
  }
}

async function downloadPDF() {
  renderPreview();
  const node = document.getElementById('pdf-content');
  const scale = 2;
  const canvas = await html2canvas(node, {scale, useCORS: true, backgroundColor: '#fff'});
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation: 'portrait', unit: 'mm', format: 'a4'});
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pxToMm = pageWidth / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width*pxToMm, canvas.height*pxToMm);
  pdf.save(($('inputTitle').value || 'document') + '.pdf');
}

$('btnPreview').addEventListener('click', ()=>renderPreview());
$('btnDownload').addEventListener('click', ()=>downloadPDF());
$('btnReset').addEventListener('click', ()=>{
  $('inputTitle').value = '引退LIVE';
  $('inputSongs').value = `初陣
臨道
祭ノ祭
合祭
笑ノ舞
いろどり
風神雷神
紫焔楽
戦`;
  $('inputNumPref').value = 6;
  $('inputChecks').value = 'MC';
  $('inputRemarksDisplay').value = 'yes'; // リセット時に表示
  renderPreview();
});

renderPreview();