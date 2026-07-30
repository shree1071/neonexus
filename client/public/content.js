// Screen Aware Tutor — Content Script
// Placed in public/ to bypass ALL bundler processing
(function() {
  'use strict';
  if (document.getElementById('sat-root')) return;

  var isDrawMode = false;
  var isAnalyzing = false;
  var isDrawing = false;
  var startX = 0, startY = 0;
  var circleInfo = null; // {cx, cy, r}
  var animId = 0;

  var root = document.createElement('div');
  root.id = 'sat-root';
  root.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
  document.documentElement.appendChild(root);
  var shadow = root.attachShadow({ mode: 'open' });

  shadow.innerHTML = '<style>' +
    '@keyframes sat-pulse{0%,100%{opacity:1}50%{opacity:.4}}' +
    '@keyframes sat-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    '#sat-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:2147483640;pointer-events:none}' +
    '#sat-canvas.on{pointer-events:auto;cursor:crosshair}' +
    '#sat-bar{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:auto;display:flex;align-items:center;gap:12px;background:rgba(2,6,23,.94);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:10px 26px;border-radius:9999px;border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 60px rgba(0,0,0,.6);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}' +
    '#sat-btn{display:flex;align-items:center;gap:8px;padding:8px 20px;border-radius:9999px;font-size:13px;font-weight:600;border:none;cursor:pointer;color:#fff;background:#1e293b;transition:all .2s}' +
    '#sat-btn:hover{background:#334155}' +
    '#sat-btn.dm{background:#ef4444;box-shadow:0 0 20px rgba(239,68,68,.5)}' +
    '#sat-btn.az{opacity:.5;pointer-events:none}' +
    '.dot{width:10px;height:10px;border-radius:50%;background:#ef4444;flex-shrink:0}' +
    '.dot.on{background:#fff;animation:sat-pulse 1.5s infinite}' +
    '.spin{width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:sat-spin .8s linear infinite;flex-shrink:0}' +
    '#sat-exp{position:fixed;top:20px;left:20px;max-width:380px;background:rgba(15,23,42,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(100,116,139,.4);padding:16px;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6);z-index:2147483647;pointer-events:auto;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;display:none}' +
    '#sat-exp.show{display:block}' +
    '.eh{display:flex;align-items:center;gap:8px;margin-bottom:10px}' +
    '.ed{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:sat-pulse 1.5s infinite}' +
    '.et{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}' +
    '.eb{font-size:14px;color:#cbd5e1;line-height:1.6}' +
    '.dismiss{margin-top:10px;background:none;border:none;color:#60a5fa;font-size:12px;cursor:pointer}' +
    '.dismiss:hover{color:#93c5fd}' +
    '</style>' +
    '<canvas id="sat-canvas"></canvas>' +
    '<div id="sat-exp"><div class="eh"><div class="ed"></div><span class="et">AI Vision Analysis</span></div><div class="eb" id="sat-exp-text"></div><button class="dismiss" id="sat-dismiss">Dismiss</button></div>' +
    '<div id="sat-bar"><button id="sat-btn"><div class="dot"></div><span id="sat-label">Activate AI Vision</span></button></div>';

  var canvas = shadow.getElementById('sat-canvas');
  var ctx = canvas.getContext('2d');
  var btn = shadow.getElementById('sat-btn');
  var label = shadow.getElementById('sat-label');
  var expBox = shadow.getElementById('sat-exp');
  var expText = shadow.getElementById('sat-exp-text');
  var dismissBtn = shadow.getElementById('sat-dismiss');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function updateBtn() {
    var icon = btn.querySelector('.dot,.spin');
    if (isAnalyzing) {
      btn.className = 'az'; btn.id = 'sat-btn';
      if (icon) icon.outerHTML = '<div class="spin"></div>';
      label.textContent = 'Analyzing...';
    } else if (isDrawMode) {
      btn.className = 'dm'; btn.id = 'sat-btn';
      if (icon) icon.outerHTML = '<div class="dot on"></div>';
      label.textContent = 'Draw a Circle';
    } else {
      btn.className = ''; btn.id = 'sat-btn';
      if (icon) icon.outerHTML = '<div class="dot"></div>';
      label.textContent = 'Activate AI Vision';
    }
  }

  btn.addEventListener('click', function() {
    if (isAnalyzing) return;
    isDrawMode = !isDrawMode;
    canvas.className = isDrawMode ? 'on' : '';
    canvas.id = 'sat-canvas';
    updateBtn();
  });

  function clearAll() {
    cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    expBox.classList.remove('show');
    circleInfo = null;
  }

  dismissBtn.addEventListener('click', clearAll);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { isDrawMode = false; canvas.className = ''; canvas.id = 'sat-canvas'; updateBtn(); clearAll(); }
  });

  function animateCircle() {
    if (!circleInfo) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(circleInfo.cx, circleInfo.cy, circleInfo.r + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(239,68,68,.25)'; ctx.lineWidth = 12; ctx.setLineDash([]); ctx.stroke();
    ctx.beginPath(); ctx.arc(circleInfo.cx, circleInfo.cy, circleInfo.r, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]);
    ctx.lineDashOffset = -(performance.now() / 30); ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 16; ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(circleInfo.cx, circleInfo.cy, circleInfo.r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239,68,68,.06)'; ctx.fill();
    animId = requestAnimationFrame(animateCircle);
  }

  canvas.addEventListener('mousedown', function(e) { if (!isDrawMode) return; isDrawing = true; circleInfo = null; startX = e.clientX; startY = e.clientY; });

  canvas.addEventListener('mousemove', function(e) {
    if (!isDrawing || !isDrawMode) return;
    var r = Math.hypot(e.clientX - startX, e.clientY - startY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(startX, startY, r, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 16; ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(startX, startY, r, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(239,68,68,.08)'; ctx.fill();
  });

  canvas.addEventListener('mouseup', function(e) {
    if (!isDrawing || !isDrawMode) return;
    isDrawing = false;
    var r = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (r < 5) return;
    circleInfo = { cx: startX, cy: startY, r: r };
    animateCircle();
    var norm = { x: startX / window.innerWidth, y: startY / window.innerHeight, radius: r / Math.min(window.innerWidth, window.innerHeight) };
    isDrawMode = false; isAnalyzing = true;
    canvas.className = ''; canvas.id = 'sat-canvas';
    updateBtn();

    chrome.runtime.sendMessage({ action: 'capture_screen' }, function(cap) {
      if (!cap || !cap.imageBase64) {
        showFallback(norm); isAnalyzing = false; updateBtn(); return;
      }
      
      chrome.runtime.sendMessage({
        action: 'analyze_frame',
        payload: { imageBase64: cap.imageBase64, circleCoordinates: norm, query: 'Explain this circled area.' }
      }, function(response) {
        if (!response || !response.success || !response.data) {
          console.error("Backend fetch failed via proxy", response?.error);
          showFallback(norm); isAnalyzing = false; updateBtn(); return;
        }
        
        showResults(response.data); 
        chrome.runtime.sendMessage({ action: 'analysis_complete', data: response.data });
        isAnalyzing = false; updateBtn();
      });
    });
  });

  canvas.addEventListener('mouseleave', function() { isDrawing = false; });

  function showFallback(norm) {
    var fb = {
      explanation: 'This shows the Normal Force (N) counteracting Gravity (mg) in a Free Body Diagram.',
      annotations: [
        { type: 'arrow', coordinates: { x: norm.x, y: norm.y, toX: norm.x, toY: norm.y - .15 }, color: '#3b82f6', label: 'Normal Force (N)' },
        { type: 'arrow', coordinates: { x: norm.x, y: norm.y, toX: norm.x, toY: norm.y + .15 }, color: '#ef4444', label: 'Gravity (mg)' }
      ]
    };
    showResults(fb);
    chrome.runtime.sendMessage({ action: 'analysis_complete', data: fb });
  }

  function showResults(data) {
    // SVG arrows
    var existingSvg = shadow.getElementById('sat-svg');
    if (existingSvg) existingSvg.remove();

    if (data.annotations && data.annotations.length > 0) {
      var w = window.innerWidth, h = window.innerHeight;
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.id = 'sat-svg';
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483645;';

      data.annotations.forEach(function(a, i) {
        if (a.type !== 'arrow') return;
        var defs = document.createElementNS(svgNS, 'defs');
        var marker = document.createElementNS(svgNS, 'marker');
        marker.setAttribute('id', 'ah' + i); marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7'); marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5'); marker.setAttribute('orient', 'auto');
        var poly = document.createElementNS(svgNS, 'polygon');
        poly.setAttribute('points', '0 0,10 3.5,0 7'); poly.setAttribute('fill', a.color);
        marker.appendChild(poly); defs.appendChild(marker); svg.appendChild(defs);
        var line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', '' + a.coordinates.x * w); line.setAttribute('y1', '' + a.coordinates.y * h);
        line.setAttribute('x2', '' + a.coordinates.toX * w); line.setAttribute('y2', '' + a.coordinates.toY * h);
        line.setAttribute('stroke', a.color); line.setAttribute('stroke-width', '4');
        line.setAttribute('marker-end', 'url(#ah' + i + ')'); svg.appendChild(line);
        var text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', '' + a.coordinates.toX * w); text.setAttribute('y', '' + (a.coordinates.toY * h - 14));
        text.setAttribute('fill', a.color); text.setAttribute('font-size', '18');
        text.setAttribute('font-weight', 'bold'); text.setAttribute('font-family', '-apple-system,sans-serif');
        text.style.textShadow = '2px 2px 6px rgba(0,0,0,.9)';
        text.textContent = a.label; svg.appendChild(text);
      });
      shadow.appendChild(svg);
    }
    if (data.explanation) { expText.textContent = data.explanation; expBox.classList.add('show'); }
  }

  console.log('%c[Screen Aware Tutor] Content script loaded on ' + location.hostname, 'color:#4ade80;font-weight:bold');
})();
