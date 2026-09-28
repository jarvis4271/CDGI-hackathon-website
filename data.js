/**
 * RoadGuard AI - Data Layer & Persistence Store
 * Provides initial mock data and localStorage sync for citizen and government views.
 */

const STORAGE_KEY = 'roadguard_potholes_v1';
const CREWS_KEY = 'roadguard_crews_v1';

// Initial pre-seeded mock potholes located in a central metro hub
// Initial pre-seeded mock potholes located around user's metro hub (Indore, India)
const INITIAL_POTHOLES = [
  {
    id: 'RG-1001',
    title: 'Severe crater near intersection crosswalk',
    address: 'Regal Square, MG Road, Indore',
    lat: 22.7196,
    lng: 75.8577,
    severity: 'high',
    status: 'in-progress',
    confidence: 0.96,
    width_cm: 52,
    depth_cm: 9,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-24T09:15:00Z',
    updatedAt: '2026-09-25T14:30:00Z',
    reportCount: 14,
    upvotes: 28,
    assignedCrew: 'Metro Asphalt Crew #1',
    assignedAt: '2026-09-25T11:00:00Z',
    assignedDepartment: 'Indore Municipal Corporation - Road Dept',
    notes: 'High traffic BRTS corridor. Urgent asphalt patch required.',
    comments: [
      { id: 'c1', user: 'Rahul Sharma', role: 'Citizen', text: 'Damaged two-wheeler suspension here yesterday.', time: '2026-09-24T18:20:00Z' },
      { id: 'c2', user: 'City Dispatch', role: 'Official', text: 'Crew #1 dispatched with hot mix asphalt truck.', time: '2026-09-25T11:05:00Z' }
    ]
  },
  {
    id: 'RG-1002',
    title: 'Expanding asphalt depression on transit lane',
    address: 'Vijay Nagar Square, AB Road',
    lat: 22.7533,
    lng: 75.8937,
    severity: 'high',
    status: 'assigned',
    confidence: 0.94,
    width_cm: 44,
    depth_cm: 7,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-25T08:45:00Z',
    updatedAt: '2026-09-25T16:00:00Z',
    reportCount: 9,
    upvotes: 19,
    assignedCrew: 'Rapid Patch Unit #4',
    assignedAt: '2026-09-25T16:00:00Z',
    assignedDepartment: 'Zone 4 Maintenance Squad',
    notes: 'Multiple vehicle complaints received. Scheduled for repairs.',
    comments: []
  },
  {
    id: 'RG-1003',
    title: 'Surface erosion and loose gravel',
    address: 'Palasia Square, Old Palasia',
    lat: 22.7244,
    lng: 75.8839,
    severity: 'medium',
    status: 'under-review',
    confidence: 0.89,
    width_cm: 32,
    depth_cm: 4,
    imageUrl: 'https://images.unsplash.com/photo-1584463699042-458cfc2ceea9?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-25T14:20:00Z',
    updatedAt: '2026-09-25T14:20:00Z',
    reportCount: 4,
    upvotes: 7,
    assignedCrew: null,
    assignedAt: null,
    assignedDepartment: 'Municipal Corporation Road Bureau',
    notes: 'Secondary lane surface peeling under heavy vehicle load.',
    comments: []
  },
  {
    id: 'RG-1004',
    title: 'Cluster of small depressions near drainage grate',
    address: 'Rajwada Chowk, Old City',
    lat: 22.7188,
    lng: 75.8550,
    severity: 'low',
    status: 'reported',
    confidence: 0.85,
    width_cm: 20,
    depth_cm: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-26T07:10:00Z',
    updatedAt: '2026-09-26T07:10:00Z',
    reportCount: 1,
    upvotes: 3,
    assignedCrew: null,
    assignedAt: null,
    assignedDepartment: 'Central Zone Civil Works',
    notes: 'Early stage alligator cracking identified by mobile vehicle AI scanner.',
    comments: []
  },
  {
    id: 'RG-1005',
    title: 'Repaired road fissure and edge collapse',
    address: 'Geeta Bhawan Square, AB Road',
    lat: 22.7210,
    lng: 75.8810,
    severity: 'high',
    status: 'repaired',
    confidence: 0.98,
    width_cm: 60,
    depth_cm: 11,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    reportedAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-24T17:00:00Z',
    reportCount: 22,
    upvotes: 45,
    assignedCrew: 'Metro Asphalt Crew #2',
    assignedAt: '2026-09-22T08:30:00Z',
    assignedDepartment: 'South Zone Engineering',
    notes: 'Full depth patch completed with thermal bonding. Inspected and cleared.',
    comments: [
      { id: 'c4', user: 'Engineer V. Gupta', role: 'Inspector', text: 'Final quality assurance passed. Sealed and smoothed.', time: '2026-09-24T16:50:00Z' }
    ]
  },
  {
    id: 'RG-1006',
    title: 'Severe pavement gap near flyover approach',
    address: 'Bhanwarkuan Square, Tower Road',
    lat: 22.6926,
    lng: 75.8676,
    severity: 'high',
    status: 'reported',
    confidence: 0.93,
    width_cm: 48,
    depth_cm: 8,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-26T11:30:00Z',
    updatedAt: '2026-09-26T11:30:00Z',
    reportCount: 8,
    upvotes: 15,
    assignedCrew: null,
    assignedAt: null,
    assignedDepartment: 'PWD Flyover Maintenance Squad',
    notes: 'Urgent detection from connected delivery fleet dashcam.',
    comments: []
  },
  {
    id: 'RG-1007',
    title: 'Moderate surface rutting on service road',
    address: 'Scheme 54, Near C21 Mall',
    lat: 22.7480,
    lng: 75.8950,
    severity: 'medium',
    status: 'assigned',
    confidence: 0.88,
    width_cm: 36,
    depth_cm: 5,
    imageUrl: 'https://images.unsplash.com/photo-1584463699042-458cfc2ceea9?auto=format&fit=crop&w=800&q=80',
    repairedImageUrl: null,
    reportedAt: '2026-09-25T17:15:00Z',
    updatedAt: '2026-09-26T09:00:00Z',
    reportCount: 3,
    upvotes: 6,
    assignedCrew: 'Rapid Patch Unit #4',
    assignedAt: '2026-09-26T09:00:00Z',
    assignedDepartment: 'Zone 3 Maintenance Squad',
    notes: 'Scheduled for tonight after traffic subsides.',
    comments: []
  }
];

const AVAILABLE_CREWS = [
  { id: 'crew-1', name: 'Metro Asphalt Crew #1', lead: 'Marcus Brody', status: 'On Site', activeJobs: 1 },
  { id: 'crew-2', name: 'Metro Asphalt Crew #2', lead: 'Elena Rostova', status: 'Available', activeJobs: 0 },
  { id: 'crew-3', name: 'District 3 Civil Works', lead: 'Tariq Al-Mansoor', status: 'Available', activeJobs: 0 },
  { id: 'crew-4', name: 'Rapid Patch Unit #4', lead: 'Carlos Santana', status: 'En Route', activeJobs: 2 },
  { id: 'crew-5', name: 'Bridge & Expressway Team', lead: 'Sarah Jenkins', status: 'Available', activeJobs: 0 }
];

// Data Store Manager
window.RoadGuardDB = {
  getPotholes: function() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.savePotholes(INITIAL_POTHOLES);
      return INITIAL_POTHOLES;
    }
    try {
      const parsed = JSON.parse(raw);
      // Auto-migrate if stored data is from old US Manhattan coordinates
      if (parsed.length > 0 && parsed.some(p => p.lat > 35 && p.lng < -50)) {
        console.log('Migrating legacy US coordinates to user location...');
        this.savePotholes(INITIAL_POTHOLES);
        return INITIAL_POTHOLES;
      }
      return parsed;
    } catch(e) {
      console.error('Failed to parse potholes:', e);
      return INITIAL_POTHOLES;
    }
  },

  savePotholes: function(potholes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(potholes));
    window.dispatchEvent(new CustomEvent('roadguard:data_updated', { detail: { potholes } }));
  },

  getCrews: function() {
    const raw = localStorage.getItem(CREWS_KEY);
    if (!raw) {
      localStorage.setItem(CREWS_KEY, JSON.stringify(AVAILABLE_CREWS));
      return AVAILABLE_CREWS;
    }
    try {
      return JSON.parse(raw);
    } catch(e) {
      return AVAILABLE_CREWS;
    }
  },

  getById: function(id) {
    const all = this.getPotholes();
    return all.find(p => p.id === id);
  },

  addPothole: function(item) {
    const all = this.getPotholes();
    
    // Duplicate check: within 0.0003 degrees (~30 meters)
    const duplicate = all.find(existing => {
      const dLat = Math.abs(existing.lat - item.lat);
      const dLng = Math.abs(existing.lng - item.lng);
      return dLat < 0.0003 && dLng < 0.0003 && existing.status !== 'repaired';
    });

    if (duplicate) {
      duplicate.reportCount = (duplicate.reportCount || 1) + 1;
      duplicate.upvotes = (duplicate.upvotes || 0) + 2;
      duplicate.updatedAt = new Date().toISOString();
      if (!duplicate.comments) duplicate.comments = [];
      duplicate.comments.push({
        id: 'c_' + Date.now(),
        user: 'Citizen Reporter',
        role: 'Citizen',
        text: 'Duplicate confirmed nearby: ' + (item.notes || 'Additional damage spotted.'),
        time: new Date().toISOString()
      });
      this.savePotholes(all);
      return { item: duplicate, isDuplicate: true };
    }

    const newId = 'RG-' + (1000 + all.length + 1);
    const newRecord = {
      id: newId,
      title: item.title || 'Road Surface Anomaly',
      address: item.address || `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`,
      lat: Number(item.lat),
      lng: Number(item.lng),
      severity: item.severity || 'medium',
      status: 'reported',
      confidence: item.confidence || 0.92,
      width_cm: item.width_cm || 30,
      depth_cm: item.depth_cm || 5,
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      repairedImageUrl: null,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportCount: 1,
      upvotes: 1,
      assignedCrew: null,
      assignedAt: null,
      assignedDepartment: 'City Road Inspection Dept',
      notes: item.notes || 'Reported via Citizen AI Mobile Portal',
      comments: [
        {
          id: 'c_' + Date.now(),
          user: 'Reporter',
          role: 'Citizen',
          text: item.notes || 'Hazard submitted for official municipal review.',
          time: new Date().toISOString()
        }
      ]
    };

    all.unshift(newRecord);
    this.savePotholes(all);
    return { item: newRecord, isDuplicate: false };
  },

  upvote: function(id) {
    const all = this.getPotholes();
    const item = all.find(p => p.id === id);
    if (item) {
      item.upvotes = (item.upvotes || 0) + 1;
      this.savePotholes(all);
      return item.upvotes;
    }
    return 0;
  },

  addComment: function(id, text, user = 'Community Member', role = 'Citizen') {
    const all = this.getPotholes();
    const item = all.find(p => p.id === id);
    if (item) {
      if (!item.comments) item.comments = [];
      const newComment = {
        id: 'c_' + Date.now(),
        user: user,
        role: role,
        text: text,
        time: new Date().toISOString()
      };
      item.comments.push(newComment);
      this.savePotholes(all);
      return newComment;
    }
    return null;
  },

  updateStatus: function(id, status, notes = null, repairedImageUrl = null) {
    const all = this.getPotholes();
    const item = all.find(p => p.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      if (notes) item.notes = notes;
      if (repairedImageUrl) item.repairedImageUrl = repairedImageUrl;
      this.savePotholes(all);
      return item;
    }
    return null;
  },

  assignCrew: function(id, crewName, department = null) {
    const all = this.getPotholes();
    const item = all.find(p => p.id === id);
    if (item) {
      item.assignedCrew = crewName;
      item.assignedAt = new Date().toISOString();
      item.status = 'assigned';
      if (department) item.assignedDepartment = department;
      this.savePotholes(all);
      return item;
    }
    return null;
  },

  resetDefaults: function() {
    this.savePotholes(INITIAL_POTHOLES);
    localStorage.setItem(CREWS_KEY, JSON.stringify(AVAILABLE_CREWS));
    return INITIAL_POTHOLES;
  },

  getStats: function() {
    const all = this.getPotholes();
    const high = all.filter(p => p.severity === 'high').length;
    const medium = all.filter(p => p.severity === 'medium').length;
    const low = all.filter(p => p.severity === 'low').length;

    const reported = all.filter(p => p.status === 'reported').length;
    const review = all.filter(p => p.status === 'under-review').length;
    const assigned = all.filter(p => p.status === 'assigned').length;
    const inProgress = all.filter(p => p.status === 'in-progress').length;
    const repaired = all.filter(p => p.status === 'repaired' || p.status === 'verified').length;

    const totalUpvotes = all.reduce((sum, p) => sum + (p.upvotes || 0), 0);

    return {
      total: all.length,
      high,
      medium,
      low,
      reported,
      review,
      assigned,
      inProgress,
      repaired,
      activePending: all.length - repaired,
      totalUpvotes
    };
  }
};
