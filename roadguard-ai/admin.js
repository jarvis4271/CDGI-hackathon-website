/**
 * RoadGuard AI - Government & Municipal Administration Dashboard Controller
 */

const RoadGuardAdmin = (function() {
  let severityChart = null;
  let pipelineChart = null;
  let selectedTargetId = null;

  function init() {
    renderKPIs();
    renderCharts();
    renderCrewsRoster();
    renderTable();
    bindEvents();

    window.addEventListener('roadguard:data_updated', () => {
      renderKPIs();
      updateCharts();
      renderTable();
    });
  }

  function renderKPIs() {
    const stats = window.RoadGuardDB.getStats();
    document.getElementById('kpi-total').textContent = stats.total;
    document.getElementById('kpi-high').textContent = stats.high;
    document.getElementById('kpi-inprogress').textContent = stats.inProgress;
    document.getElementById('kpi-repaired').textContent = stats.repaired;
  }

  function renderCharts() {
    const stats = window.RoadGuardDB.getStats();

    // Chart 1: Severity Doughnut
    const ctxSev = document.getElementById('chart-severity').getContext('2d');
    severityChart = new Chart(ctxSev, {
      type: 'doughnut',
      data: {
        labels: ['High Severity', 'Medium', 'Low'],
        datasets: [{
          data: [stats.high, stats.medium, stats.low],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        cutout: '70%'
      }
    });

    // Chart 2: Pipeline Bar
    const ctxPipe = document.getElementById('chart-pipeline').getContext('2d');
    pipelineChart = new Chart(ctxPipe, {
      type: 'bar',
      data: {
        labels: ['Reported', 'Review', 'Assigned', 'In Progress', 'Repaired'],
        datasets: [{
          label: 'Incidents',
          data: [stats.reported, stats.review, stats.assigned, stats.inProgress, stats.repaired],
          backgroundColor: ['#64748b', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { size: 9 } },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#94a3b8', font: { size: 10 }, precision: 0 },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }

  function updateCharts() {
    const stats = window.RoadGuardDB.getStats();
    if (severityChart) {
      severityChart.data.datasets[0].data = [stats.high, stats.medium, stats.low];
      severityChart.update();
    }
    if (pipelineChart) {
      pipelineChart.data.datasets[0].data = [stats.reported, stats.review, stats.assigned, stats.inProgress, stats.repaired];
      pipelineChart.update();
    }
  }

  function renderCrewsRoster() {
    const crews = window.RoadGuardDB.getCrews();
    const list = document.getElementById('crews-roster-list');
    if (!list) return;

    list.innerHTML = crews.map(c => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div>
          <span class="font-bold text-slate-200 block">${c.name}</span>
          <span class="text-[10px] text-slate-400">Lead: ${c.lead}</span>
        </div>
        <div class="text-right">
          <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            c.status === 'On Site' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
            c.status === 'En Route' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
            'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }">${c.status}</span>
          <span class="text-[10px] text-slate-500 block mt-0.5">${c.activeJobs} active jobs</span>
        </div>
      </div>
    `).join('');
  }

  function renderTable() {
    const all = window.RoadGuardDB.getPotholes();
    const statusFilter = document.getElementById('table-filter-status').value;
    const severityFilter = document.getElementById('table-filter-severity').value;

    const filtered = all.filter(p => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSev = severityFilter === 'all' || p.severity === severityFilter;
      return matchStatus && matchSev;
    });

    const tbody = document.getElementById('pothole-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-500 italic">No work orders matching the selected filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const priorityScore = (p.reportCount * 3) + (p.upvotes * 2) + (p.severity === 'high' ? 10 : p.severity === 'medium' ? 5 : 2);
      
      return `
        <tr class="hover:bg-slate-800/40 transition">
          <!-- ID & Photo -->
          <td class="py-3 px-4 flex items-center space-x-3">
            <div class="w-12 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0">
              <img src="${p.imageUrl}" alt="${p.title}" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="font-mono font-bold text-cyan-400 block">${p.id}</span>
              <span class="text-[10px] text-slate-500">${formatDate(p.reportedAt)}</span>
            </div>
          </td>

          <!-- Address -->
          <td class="py-3 px-4 max-w-[200px]">
            <p class="font-medium text-slate-200 truncate" title="${p.title}">${p.title}</p>
            <p class="text-[11px] text-slate-400 truncate" title="${p.address}"><i class="fa-solid fa-location-dot text-rose-400 mr-1"></i>${p.address}</p>
          </td>

          <!-- Severity & AI -->
          <td class="py-3 px-4">
            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              p.severity === 'high' ? 'bg-red-950/80 text-red-400 border border-red-800' :
              p.severity === 'medium' ? 'bg-amber-950/80 text-amber-400 border border-amber-800' :
              'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
            }">${p.severity}</span>
            <div class="text-[10px] text-slate-400 mt-1">
              AI: <strong class="text-cyan-400">${(p.confidence * 100).toFixed(0)}%</strong> (${p.width_cm}x${p.depth_cm}cm)
            </div>
          </td>

          <!-- Civic Priority -->
          <td class="py-3 px-4">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">
                Score: ${priorityScore}
              </span>
            </div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">${p.reportCount} reports &bull; ${p.upvotes} votes</span>
          </td>

          <!-- Status Dropdown -->
          <td class="py-3 px-4">
            <select onchange="RoadGuardAdmin.quickChangeStatus('${p.id}', this.value)" 
                    class="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                      p.status === 'repaired' ? 'text-emerald-400 border-emerald-800' :
                      p.status === 'in-progress' ? 'text-amber-400 border-amber-800' :
                      p.status === 'assigned' ? 'text-purple-400 border-purple-800' :
                      'text-slate-300'
                    } focus:outline-none">
              <option value="reported" ${p.status === 'reported' ? 'selected' : ''}>Reported</option>
              <option value="under-review" ${p.status === 'under-review' ? 'selected' : ''}>Under Review</option>
              <option value="assigned" ${p.status === 'assigned' ? 'selected' : ''}>Assigned</option>
              <option value="in-progress" ${p.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="repaired" ${p.status === 'repaired' ? 'selected' : ''}>Repaired</option>
            </select>
          </td>

          <!-- Assigned Crew -->
          <td class="py-3 px-4">
            <span class="font-medium text-slate-300 block">${p.assignedCrew || '<span class="text-slate-500 italic">None assigned</span>'}</span>
            <span class="text-[10px] text-slate-500 block truncate">${p.assignedDepartment || ''}</span>
          </td>

          <!-- Actions -->
          <td class="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
            <button onclick="RoadGuardAdmin.openAssignModal('${p.id}')" title="Assign Road Crew" 
                    class="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-800/60 font-medium transition">
              <i class="fa-solid fa-truck-pickup mr-1"></i> Dispatch
            </button>
            <button onclick="RoadGuardAdmin.openRepairModal('${p.id}')" title="Sign off Repair" 
                    class="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-800/60 font-medium transition">
              <i class="fa-solid fa-check mr-1"></i> Complete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function bindEvents() {
    document.getElementById('table-filter-status').addEventListener('change', renderTable);
    document.getElementById('table-filter-severity').addEventListener('change', renderTable);

    // Reset button
    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Reset all demo data back to default initial potholes and status?')) {
        window.RoadGuardDB.resetDefaults();
        showToast('Demo data reset to clean initial state');
      }
    });

    // Export CSV
    document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);

    // Assign Modal
    document.getElementById('btn-close-assign-modal').addEventListener('click', () => {
      document.getElementById('assign-crew-modal').classList.add('hidden');
    });
    document.getElementById('btn-cancel-assign').addEventListener('click', () => {
      document.getElementById('assign-crew-modal').classList.add('hidden');
    });
    document.getElementById('btn-confirm-assign').addEventListener('click', confirmDispatch);

    // Repair Modal
    document.getElementById('btn-close-repair-modal').addEventListener('click', () => {
      document.getElementById('repair-proof-modal').classList.add('hidden');
    });
    document.getElementById('btn-cancel-repair').addEventListener('click', () => {
      document.getElementById('repair-proof-modal').classList.add('hidden');
    });
    document.getElementById('btn-confirm-repair').addEventListener('click', confirmRepair);

    // Repair presets
    document.querySelectorAll('.btn-repair-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('repair-proof-preview').src = btn.dataset.url;
      });
    });
  }

  function openAssignModal(id) {
    selectedTargetId = id;
    const item = window.RoadGuardDB.getById(id);
    if (!item) return;

    document.getElementById('assign-hazard-info').textContent = `${item.id}: ${item.title} (${item.address})`;
    
    // Fill crews select
    const crews = window.RoadGuardDB.getCrews();
    const select = document.getElementById('select-crew');
    select.innerHTML = crews.map(c => `
      <option value="${c.name}">${c.name} (${c.lead} &bull; ${c.status})</option>
    `).join('');

    document.getElementById('assign-crew-modal').classList.remove('hidden');
  }

  function confirmDispatch() {
    if (!selectedTargetId) return;
    const crewName = document.getElementById('select-crew').value;
    const department = document.getElementById('input-department').value;
    const notes = document.getElementById('input-dispatch-notes').value;

    window.RoadGuardDB.assignCrew(selectedTargetId, crewName, department);
    if (notes) {
      window.RoadGuardDB.addComment(selectedTargetId, `Dispatch order issued: ${notes}`, 'City Dispatch', 'Official');
    }

    document.getElementById('assign-crew-modal').classList.add('hidden');
    showToast(`Work order dispatched to ${crewName}!`);
  }

  function openRepairModal(id) {
    selectedTargetId = id;
    const item = window.RoadGuardDB.getById(id);
    if (!item) return;

    document.getElementById('repair-hazard-info').textContent = `${item.id}: ${item.title} (${item.address})`;
    document.getElementById('repair-proof-modal').classList.remove('hidden');
  }

  function confirmRepair() {
    if (!selectedTargetId) return;
    const proofUrl = document.getElementById('repair-proof-preview').src;
    const notes = document.getElementById('repair-notes').value;

    window.RoadGuardDB.updateStatus(selectedTargetId, 'repaired', notes, proofUrl);
    window.RoadGuardDB.addComment(selectedTargetId, `Quality assurance inspected and road restored. ${notes}`, 'QA Engineer', 'Official');

    document.getElementById('repair-proof-modal').classList.add('hidden');
    showToast('Road repair certified and marked as Repaired & Verified!');
  }

  function quickChangeStatus(id, newStatus) {
    window.RoadGuardDB.updateStatus(id, newStatus);
    showToast(`Incident ${id} updated to ${newStatus.toUpperCase()}`);
  }

  function exportToCSV() {
    const potholes = window.RoadGuardDB.getPotholes();
    let csv = 'ID,Title,Address,Latitude,Longitude,Severity,Status,AI_Confidence,Width_cm,Depth_cm,ReportCount,Upvotes,AssignedCrew,ReportedAt\n';

    potholes.forEach(p => {
      const row = [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.address.replace(/"/g, '""')}"`,
        p.lat,
        p.lng,
        p.severity,
        p.status,
        p.confidence,
        p.width_cm,
        p.depth_cm,
        p.reportCount,
        p.upvotes,
        `"${(p.assignedCrew || '').replace(/"/g, '""')}"`,
        p.reportedAt
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `roadguard_incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported incidents dataset to CSV file');
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'glass-panel px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 text-xs text-white flex items-center space-x-2.5 transform transition-all duration-300 translate-y-3 opacity-0';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check text-amber-400 text-sm"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return {
    init,
    openAssignModal,
    openRepairModal,
    quickChangeStatus
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  RoadGuardAdmin.init();
});
