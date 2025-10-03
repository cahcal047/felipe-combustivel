(function(){
	'use strict';

	const STORAGE_KEY = 'equipamentos.base.v1';
	let state = loadState();
	let charts = { eficiencia:null, combustivel:null };

	// Navegação por abas
	document.querySelectorAll('.tab-button').forEach(btn=>{
		btn.addEventListener('click',()=>{
			document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
			document.querySelectorAll('.tab-content').forEach(s=>s.classList.remove('active'));
			btn.classList.add('active');
			document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
			if(btn.dataset.tab==='relatorios'){renderReports();}
			if(btn.dataset.tab==='graficos'){renderCharts();}
		});
	});

	// Formulário
	const form = document.getElementById('entry-form');
	const tbody = document.querySelector('#base-table tbody');
	document.getElementById('add-new').addEventListener('click',()=>{ form.reset(); document.getElementById('row-id').value=''; });

	form.addEventListener('submit', (e)=>{
		e.preventDefault();
		const entry = readForm();
		const id = document.getElementById('row-id').value;
		if(id){
			const idx = state.findIndex(r=>r.id===id);
			if(idx>=0){ state[idx] = entry; }
		}else{
			state.push(entry);
		}
		saveState();
		renderTable();
		form.reset();
		document.getElementById('row-id').value='';
	});

	tbody.addEventListener('click', (e)=>{
		const btn = e.target.closest('button[data-action]');
		if(!btn) return;
		const id = btn.dataset.id;
		if(btn.dataset.action==='edit'){
			const row = state.find(r=>r.id===id);
			if(!row) return;
			fillForm(row);
		}else if(btn.dataset.action==='delete'){
			state = state.filter(r=>r.id!==id);
			saveState();
			renderTable();
		}
	});

	// CSV export/import
	document.getElementById('export-csv').addEventListener('click',()=>{
		const csv = toCSV(state);
		download('base.csv', csv, 'text/csv');
	});
	document.getElementById('import-csv').addEventListener('change',(ev)=>{
		const file = ev.target.files && ev.target.files[0];
		if(!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try{
				const parsed = fromCSV(String(reader.result));
				state = parsed;
				saveState();
				renderTable();
			} catch(err){
				alert('CSV inválido: '+ err.message);
			}
		};
		reader.readAsText(file);
		// reset input para permitir importar o mesmo arquivo novamente
		ev.target.value='';
	});

	// Cálculo de eficiência automático
	['kmh','combustivel'].forEach(id=>{
		document.getElementById(id).addEventListener('input',()=>{
			const kmh = parseFloatValue(document.getElementById('kmh').value);
			const horas = 0; // campo removido
			const combustivel = parseFloatValue(document.getElementById('combustivel').value);
			const kmRodados = 0; // sem horas não calculamos km por velocidade
			let eficiencia = '';
			if(combustivel>0 && kmRodados>0){ eficiencia = (kmRodados/combustivel).toFixed(2); }
			document.getElementById('eficiencia').value = eficiencia;
		});
	});

	// Inicialização
	renderTable();
	// preço do combustível persistido
	const precoInput = document.getElementById('preco-comb');
	const savedPrice = parseFloat(localStorage.getItem('preco_combustivel')||'0');
	if(precoInput){ precoInput.value = savedPrice ? String(savedPrice) : ''; }
	document.getElementById('aplicar-preco')?.addEventListener('click',()=>{
		const p = parseFloatValue(precoInput.value);
		localStorage.setItem('preco_combustivel', String(p));
		renderReports();
	});
	// ações filtros
	document.getElementById('aplicar-filtros')?.addEventListener('click',()=>renderReports());
	document.getElementById('limpar-filtros')?.addEventListener('click',()=>{
		const ids=['filtro-de','filtro-ate','filtro-modelo','filtro-equip'];
		ids.forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
		renderReports();
	});

	// Funções auxiliares
	function readForm(){
		const id = document.getElementById('row-id').value || cryptoRandomId();
		const equipamento = valueOf('equipamento');
		const modelo = valueOf('modelo');
		const unidade = valueOf('unidade');
		const kmh = parseFloatValue(valueOf('kmh'));
		const trabalhadas = 0;
		const combustivel = parseFloatValue(valueOf('combustivel'));
		const eficiencia = parseFloatValue(valueOf('eficiencia'));
		const data = valueOf('data-registro');
		return { id, equipamento, modelo, unidade, kmh, trabalhadas, combustivel, eficiencia, data };
	}
	function fillForm(row){
		document.getElementById('row-id').value = row.id;
		setValue('equipamento', row.equipamento);
		setValue('modelo', row.modelo);
		setValue('unidade', row.unidade);
		setValue('kmh', row.kmh);
		setValue('trabalhadas', row.trabalhadas);
		setValue('combustivel', row.combustivel);
		setValue('eficiencia', row.eficiencia ?? '');
		setValue('data-registro', row.data ?? '');
	}
	function renderTable(){
		tbody.innerHTML = state.map(r=>{
			return `<tr>
				<td>${escapeHtml(r.equipamento)}</td>
				<td>${escapeHtml(r.modelo)}</td>
				<td>${escapeHtml(r.unidade)}</td>
				<td>${formatNumber(r.kmh)} / ${formatNumber(r.trabalhadas||0)}</td>
				<td>${formatNumber(r.combustivel)}</td>
				<td>${r.eficiencia!==undefined && r.eficiencia!==null && r.eficiencia!=='' ? formatNumber(r.eficiencia) : '-'}</td>
				<td>
					<button data-action="edit" data-id="${r.id}" class="secondary">Editar</button>
					<button data-action="delete" data-id="${r.id}">Excluir</button>
				</td>
			</tr>`;
		}).join('');
	}

	function renderReports(){
		const container = document.getElementById('reports-container');
		const extra = document.getElementById('reports-extra');

		// Filtros
		const fd = document.getElementById('filtro-de')?.value;
		const fa = document.getElementById('filtro-ate')?.value;
		const fm = document.getElementById('filtro-modelo')?.value?.trim().toLowerCase();
		const fe = document.getElementById('filtro-equip')?.value?.trim().toLowerCase();
		let rows = state.slice();
		if(fd){ rows = rows.filter(r=> (r.data||'') >= fd); }
		if(fa){ rows = rows.filter(r=> (r.data||'') <= fa); }
		if(fm){ rows = rows.filter(r=> String(r.modelo||'').toLowerCase().includes(fm)); }
		if(fe){ rows = rows.filter(r=> String(r.equipamento||'').toLowerCase().includes(fe)); }

		const totalHoras = sum(rows.map(r=>r.trabalhadas));
		const totalComb = sum(rows.map(r=>r.combustivel));
		const mediaKmh = avg(rows.map(r=>r.kmh));
		const kmTotais = sum(rows.map(totalKmFromRow));
		const eficienciaMedia = totalComb>0 ? (kmTotais/totalComb) : 0;

		// Agrupamentos
		const byEquip = groupBy(rows, r=>r.equipamento);
		const byModelo = groupBy(rows, r=>r.modelo);
		const horasPorEquip = mapGroupSum(byEquip, 'trabalhadas');
		const horasPorModelo = mapGroupSum(byModelo, 'trabalhadas');
		const combPorEquip = mapGroupSum(byEquip, 'combustivel');
		const preco = parseFloat(localStorage.getItem('preco_combustivel')||'0');
		const custoTotal = preco * totalComb;
		const custoHora = totalHoras>0 ? (custoTotal/totalHoras) : 0;

		container.innerHTML = `
			<div class="card"><h3>Total de Horas</h3><div><strong>${formatNumber(totalHoras)}</strong> h</div></div>
			<div class="card"><h3>Combustivel</h3><div><strong>${formatNumber(totalComb)}</strong> L</div></div>
			<div class="card"><h3>Média KM/h</h3><div><strong>${formatNumber(mediaKmh)}</strong></div></div>
			<div class="card"><h3>Km Totais</h3><div><strong>${formatNumber(kmTotais)}</strong> km</div></div>
			<div class="card"><h3>Eficiência Média</h3><div><strong>${formatNumber(eficienciaMedia || 0)}</strong> km/L</div></div>
			<div class="card"><h3>Custo Total</h3><div><strong>R$ ${formatNumber(custoTotal)}</strong></div></div>
			<div class="card"><h3>Custo por Hora</h3><div><strong>R$ ${formatNumber(custoHora)}</strong></div></div>
		`;

		// Rankings e participação
		const equipMaisHoras = maxEntry(horasPorEquip);
		const equipMenosHoras = minEntry(horasPorEquip);
		const rankingConsumoHora = Object.entries(byEquip).map(([equip, rows])=>{
			const horas = sum(rows.map(r=>r.trabalhadas));
			const comb = sum(rows.map(r=>r.combustivel));
			return { equip, valor: horas>0 ? comb/horas : 0 };
		}).sort((a,b)=>b.valor-a.valor).slice(0,5);
		const eficienciaPorModelo = Object.entries(byModelo).map(([modelo, rows])=>{
			const km = sum(rows.map(totalKmFromRow));
			const comb = sum(rows.map(r=>r.combustivel));
			return { modelo, valor: comb>0 ? km/comb : 0 };
		}).sort((a,b)=>b.valor-a.valor).slice(0,5);

		extra.innerHTML = `
			<div class="card">
				<h3>Horas por Modelo (top 5)</h3>
				<div>${topList(horasPorModelo,5,' h')}</div>
			</div>
			<div class="card">
				<h3>Mais Utilizado / Menos Utilizado</h3>
				<div><strong>Mais</strong>: ${equipMaisHoras?.key ?? '-'} (${formatNumber(equipMaisHoras?.value||0)} h)</div>
				<div><strong>Menos</strong>: ${equipMenosHoras?.key ?? '-'} (${formatNumber(equipMenosHoras?.value||0)} h)</div>
			</div>
			<div class="card">
				<h3>Ranking Consumo por Hora (L/h)</h3>
				<ol>${rankingConsumoHora.map(i=>`<li>${escapeHtml(i.equip)} — ${formatNumber(i.valor)} L/h</li>`).join('')}</ol>
			</div>
			<div class="card">
				<h3>Eficiência média por modelo (km/L)</h3>
				<ol>${eficienciaPorModelo.map(i=>`<li>${escapeHtml(i.modelo)} — ${formatNumber(i.valor)} km/L</li>`).join('')}</ol>
			</div>
			<div class="card">
				<h3>Participação por Equipamento</h3>
				<div>Horas: ${percentList(horasPorEquip, totalHoras)}</div>
				<div>Combustível: ${percentList(combPorEquip, totalComb)}</div>
			</div>
		`;
	}

	function renderCharts(){
		// Garante Chart carregado
		if(typeof Chart === 'undefined'){
			const s = document.createElement('script');
			s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
			s.onload = ()=> renderCharts();
			document.head.appendChild(s);
			return;
		}
		const labels = state.map(r=>r.equipamento || '—');
		const eficiencia = state.map(r=>{
			const km = totalKmFromRow(r);
			return r.combustivel>0 ? km/r.combustivel : (r.eficiencia || 0);
		});
		const combustivel = state.map(r=>r.combustivel);

		const ctxE = document.getElementById('chart-eficiencia');
		const ctxC = document.getElementById('chart-combustivel');
		if(!ctxE || !ctxC) return;

		// destruir gráficos anteriores para evitar vazamento
		if(charts.eficiencia){ charts.eficiencia.destroy(); }
		if(charts.combustivel){ charts.combustivel.destroy(); }

		charts.eficiencia = new Chart(ctxE.getContext('2d'), {
			type:'bar',
			data:{ labels, datasets:[{ label:'Eficiência (km/L)', data: eficiencia, backgroundColor:'#22c55e' }] },
			options:{ responsive:true, maintainAspectRatio:false }
		});
		charts.combustivel = new Chart(ctxC.getContext('2d'), {
			type:'line',
			data:{ labels, datasets:[{ label:'Combustivel (L)', data: combustivel, borderColor:'#60a5fa', backgroundColor:'rgba(96,165,250,.2)' }] },
			options:{ responsive:true, maintainAspectRatio:false }
		});
	}

	// Persistência
	function loadState(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			if(!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		}catch{ return []; }
	}
	function saveState(){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}

	// Utilitários
	function valueOf(id){ return document.getElementById(id).value.trim(); }
	function setValue(id,v){ document.getElementById(id).value = v ?? ''; }
	function parseFloatValue(v){
		// aceita formato BR: 10.115,00 -> 10115.00
		const raw = String(v ?? '').trim();
		if(!raw) return 0;
		const sanitized = raw.replace(/\./g,'').replace(',', '.');
		const n = parseFloat(sanitized);
		return isNaN(n) ? 0 : n;
	}
	function formatNumber(v){ return Number(v||0).toLocaleString('pt-BR', { maximumFractionDigits:2 }); }
	function sum(arr){ return arr.reduce((a,b)=>a+(Number(b)||0),0); }
	function avg(arr){ return arr.length? sum(arr)/arr.length : 0; }
	function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c])); }
	function cryptoRandomId(){
		if(window.crypto && crypto.randomUUID){ return crypto.randomUUID(); }
		return 'id-' + Math.random().toString(36).slice(2,10);
	}

	function groupBy(arr, keyFn){
		return arr.reduce((acc,item)=>{
			const k = keyFn(item) || '—';
			(acc[k] ||= []).push(item);
			return acc;
		},{});
	}
	function mapGroupSum(groups, field){
		const out = {};
		Object.entries(groups).forEach(([k,rows])=>{ out[k] = sum(rows.map(r=>r[field])); });
		return out;
	}
	function maxEntry(obj){
		let best=null; Object.entries(obj).forEach(([k,v])=>{ if(best===null || v>best.value){ best={key:k,value:v}; } }); return best;
	}
	function minEntry(obj){
		let best=null; Object.entries(obj).forEach(([k,v])=>{ if(best===null || v<best.value){ best={key:k,value:v}; } }); return best;
	}
	function topList(mapObj, n, suffix=''){
		return Object.entries(mapObj)
			.sort((a,b)=>b[1]-a[1])
			.slice(0,n)
			.map(([k,v])=>`<div>${escapeHtml(k)} — <strong>${formatNumber(v)}</strong>${suffix}</div>`)
			.join('');
	}
	function percentList(mapObj, total){
		if(total<=0) return '-';
		return '<ul>'+Object.entries(mapObj).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
			const pct = (100*v/total);
			return `<li>${escapeHtml(k)} — ${pct.toFixed(1)}%</li>`;
		}).join('')+'</ul>';
	}

	// Deriva quilômetros percorridos caso base não tenha KM/h
	function totalKmFromRow(row){
		const kmBySpeed = Number(row.kmh||0) * Number(row.trabalhadas||0);
		if(kmBySpeed>0) return kmBySpeed;
		// Se não há km/h, tenta usar eficiência (km/L) * combustível
		if(row.eficiencia && row.combustivel){
			const val = Number(row.eficiencia||0) * Number(row.combustivel||0);
			if(val>0) return val;
		}
		return 0;
	}

	function toCSV(rows){
		// Exporta exatamente nas 6 colunas do layout solicitado
		const header = ['Equipamento','Modelo','Unidade','KM/h Trabalhadas','Combustivel Consumido','Km/l / L/h'];
		const lines = [header.join(';')];
		rows.forEach(r=>{
			lines.push([
				r.equipamento,
				r.modelo,
				r.unidade,
				r.trabalhadas,
				r.combustivel,
				r.eficiencia ?? ''
			].map(v=>String(v??'')).join(';'));
		});
		return lines.join('\n');
	}
	function fromCSV(csv){
		const lines = csv.split(/\r?\n/).filter(l=>l.trim().length>0);
		if(lines.length < 2) return [];
		// Detecta delimitador: ; , ou tab
		const headerLine = lines[0];
		const delimiter = headerLine.includes(';') ? ';' : (headerLine.includes('\t') ? '\t' : ',');
		const headers = headerLine.split(delimiter).map(h=>h.trim());
		const norm = (s)=> s.toLowerCase()
			.replace(/[áàâãä]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i')
			.replace(/[óòôõö]/g,'o').replace(/[úùûü]/g,'u').replace(/[ç]/g,'c')
			.replace(/[^a-z0-9/ ]+/g,'').replace(/\s+/g,' ').trim();
		const nameToIndex = {};
		headers.forEach((h,i)=>{ nameToIndex[norm(h)] = i; });
		// Possíveis nomes normalizados
		let idxEquip = nameToIndex[norm('Equipamento')];
		let idxModelo = nameToIndex[norm('Modelo')];
		let idxUnidade = nameToIndex[norm('Unidade')];
		let idxTrab = nameToIndex[norm('KM/h Trabalhadas')] ?? nameToIndex[norm('Trabalhadas')] ?? nameToIndex[norm('Horas Trabalhadas')];
		let idxComb = nameToIndex[norm('Combustivel Consumido')] ?? nameToIndex[norm('Combustível Consumido')] ?? nameToIndex[norm('Combustivel')] ?? nameToIndex[norm('Consumo')];
		let idxEf = nameToIndex[norm('Km/l / L/h')] ?? nameToIndex[norm('Km/l')] ?? nameToIndex[norm('L/h')];

		// Fallback: se layout tiver exatamente 6 colunas, usar posições padrão
		if(headers.length === 6){
			if(idxEquip===undefined) idxEquip = 0;
			if(idxModelo===undefined) idxModelo = 1;
			if(idxUnidade===undefined) idxUnidade = 2;
			if(idxTrab===undefined) idxTrab = 3;
			if(idxComb===undefined) idxComb = 4;
			if(idxEf===undefined) idxEf = 5;
		}

		const out = [];
		for(let i=1;i<lines.length;i++){
			const cols = lines[i].split(delimiter);
			const equipamento = getCol(cols, idxEquip);
			const modelo = getCol(cols, idxModelo);
			const unidade = getCol(cols, idxUnidade);
			const trabalhadas = parseFloatValue(getCol(cols, idxTrab));
			const combustivel = parseFloatValue(getCol(cols, idxComb));
			const eficiencia = getCol(cols, idxEf) !== '' ? parseFloatValue(getCol(cols, idxEf)) : '';
			out.push({
				id: cryptoRandomId(),
				equipamento, modelo, unidade,
				kmh: 0,
				trabalhadas,
				combustivel,
				eficiencia
			});
		}
		return out;

		function getCol(arr, idx){ return idx!==undefined ? String(arr[idx] ?? '').trim() : ''; }
	}
	function download(filename, content, type){
		const blob = new Blob([content], { type });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = filename; a.click();
		URL.revokeObjectURL(url);
	}
})();
