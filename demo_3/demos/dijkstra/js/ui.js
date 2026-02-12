/* ═══════════════════════════════════════════════════════════
   ui.js — UI controls, panels, lessons, and theme toggle
   ═══════════════════════════════════════════════════════════ */

// eslint-disable-next-line no-unused-vars
const UI = (() => {
    'use strict';

    /* ── DOM refs ── */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    let els = {};   // populated in init
    let currentMode = 'select';
    let edgeSourceNode = null;   // for add-edge mode
    let autoplayTimer = null;
    let isPlaying = false;

    /* ── Lesson data ── */
    const LESSONS = [
        {
            title: '1. What does Dijkstra solve?',
            content: `
        <h3>The Shortest-Path Problem</h3>
        <p>Given a <strong>weighted graph</strong> and a <strong>source node</strong>, Dijkstra's algorithm finds the <em>shortest path</em> from the source to every other reachable node.</p>
        <div class="highlight-box">
          <strong>Real-world uses:</strong> GPS navigation, network routing, game AI pathfinding, logistics optimisation.
        </div>
        <p>The algorithm produces two arrays:</p>
        <ul>
          <li><code>dist[v]</code> — the shortest distance from the source to v</li>
          <li><code>prev[v]</code> — the predecessor of v on that shortest path</li>
        </ul>
        <button class="btn btn--primary lesson-demo-btn" data-lesson="0">▶ Show on graph</button>
      `
        },
        {
            title: '2. Preconditions',
            content: `
        <h3>Non-Negative Weights Only</h3>
        <p>Dijkstra <strong>requires all edge weights to be ≥ 0</strong>. If any weight is negative, the algorithm may produce incorrect results.</p>
        <div class="highlight-box">
          ⚠️ For graphs with negative edges, use <strong>Bellman-Ford</strong> instead.
        </div>
        <p>This app validates your graph: if you enter a negative weight, the <em>Run</em> button will be disabled and an error is shown.</p>
        <button class="btn btn--primary lesson-demo-btn" data-lesson="1">▶ Show on graph</button>
      `
        },
        {
            title: '3. Key data structures',
            content: `
        <h3>dist[], prev[], Priority Queue</h3>
        <p><strong>dist[v]</strong> tracks the best-known distance from source to v. Initially <code>∞</code> for all except the source (which is 0).</p>
        <p><strong>prev[v]</strong> records the previous node on the shortest path to v. Used to reconstruct the path at the end.</p>
        <p><strong>Priority Queue (PQ)</strong> holds nodes ordered by their tentative distance. Each step extracts the node with the <em>smallest</em> distance.</p>
        <div class="highlight-box">
          Look at the panels on the right to see these data structures update <em>live</em> as the algorithm runs!
        </div>
        <button class="btn btn--primary lesson-demo-btn" data-lesson="2">▶ Show on graph</button>
      `
        },
        {
            title: '4. The greedy step',
            content: `
        <h3>Extract-Min & Relax</h3>
        <p>Each iteration:</p>
        <ol>
          <li><strong>Extract</strong> the node <code>u</code> with the smallest <code>dist[u]</code> from the PQ.</li>
          <li><strong>Finalize</strong> <code>u</code> — its distance is now guaranteed optimal.</li>
          <li><strong>Relax</strong> each neighbor <code>v</code> of <code>u</code>: if <code>dist[u] + weight(u,v) < dist[v]</code>, update <code>dist[v]</code> and <code>prev[v]</code>.</li>
        </ol>
        <div class="highlight-box">
          The <span style="color:var(--clr-current)">●</span> red glow shows the current node. <span style="color:var(--clr-updated)">●</span> Purple highlights show updated neighbors.
        </div>
        <button class="btn btn--primary lesson-demo-btn" data-lesson="3">▶ Show on graph</button>
      `
        },
        {
            title: '5. Walkthrough example',
            content: `
        <h3>Try It Yourself!</h3>
        <p>Click <strong>"Show on graph"</strong> to load the Simple 6-Node scenario. Then use <strong>Step →</strong> to walk through each algorithm step.</p>
        <p>Watch how:</p>
        <ul>
          <li>The <strong>distance table</strong> updates</li>
          <li>Nodes change color as they're explored</li>
          <li>The <strong>pseudocode</strong> highlights the executing line</li>
          <li>The <strong>priority queue</strong> reorders itself</li>
        </ul>
        <button class="btn btn--primary lesson-demo-btn" data-lesson="4">▶ Load example & start</button>
      `
        },
    ];

    /* ═════════════ INIT ═════════════ */
    function init() {
        _cacheElements();
        _initTheme();
        _initLessons();
        _initPseudocode();
        _bindToolbar();
        _bindAlgoControls();
        _bindSidebars();
        _bindEdgeDialog();
        _bindAccessibility();
    }

    function _cacheElements() {
        els = {
            // Topbar
            btnTheme: $('#btn-theme'),
            iconSun: $('#icon-sun'),
            iconMoon: $('#icon-moon'),

            // Sidebars
            lessonSidebar: $('#lesson-sidebar'),
            btnLessonToggle: $('#btn-lesson-toggle'),
            btnCloseLesson: $('#btn-close-lesson'),
            lessonList: $('#lesson-list'),
            lessonContent: $('#lesson-content'),
            panelsSidebar: $('.sidebar--panels'),
            btnPanelsToggle: $('#btn-panels-toggle'),

            // Toolbar
            modeButtons: $$('[data-mode]'),
            toggleDirected: $('#toggle-directed'),
            toggleTrack: $('.toggle-track'),
            scenarioSelect: $('#scenario-select'),
            startNode: $('#start-node'),
            targetNode: $('#target-node'),

            // Error
            errorBanner: $('#error-banner'),
            errorMsg: $('#error-msg'),
            btnDismissError: $('#btn-dismiss-error'),

            // Algo controls
            btnRun: $('#btn-run'),
            btnStep: $('#btn-step'),
            btnBack: $('#btn-back'),
            btnPlayPause: $('#btn-playpause'),
            btnReset: $('#btn-reset'),
            speedSlider: $('#speed-slider'),
            stepK: $('#step-k'),

            // Panels
            distTableBody: $('#dist-table tbody'),
            visitedChips: $('#visited-chips'),
            pqList: $('#pq-list'),
            pseudocodeEl: $('#pseudocode'),

            // Dialog
            edgeDialog: $('#edge-dialog'),
            edgeForm: $('#edge-form'),
            edgeWeightInput: $('#edge-weight-input'),
            btnCancelEdge: $('#btn-cancel-edge'),
        };
    }

    /* ═════════════ THEME ═════════════ */
    function _initTheme() {
        const saved = localStorage.getItem('dijkstra-theme');
        if (saved) document.documentElement.dataset.theme = saved;
        _updateThemeIcons();

        els.btnTheme.addEventListener('click', () => {
            const html = document.documentElement;
            const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
            html.dataset.theme = next;
            localStorage.setItem('dijkstra-theme', next);
            _updateThemeIcons();
        });
    }

    function _updateThemeIcons() {
        const isDark = document.documentElement.dataset.theme === 'dark';
        els.iconSun.style.display = isDark ? 'block' : 'none';
        els.iconMoon.style.display = isDark ? 'none' : 'block';
    }

    /* ═════════════ LESSONS ═════════════ */
    function _initLessons() {
        LESSONS.forEach((lesson, i) => {
            const li = document.createElement('li');
            li.textContent = lesson.title;
            li.dataset.index = i;
            li.setAttribute('role', 'listitem');
            li.tabIndex = 0;
            li.addEventListener('click', () => _selectLesson(i));
            li.addEventListener('keydown', (e) => { if (e.key === 'Enter') _selectLesson(i); });
            els.lessonList.appendChild(li);
        });
        _selectLesson(0);
    }

    function _selectLesson(index) {
        els.lessonList.querySelectorAll('li').forEach((li, i) => {
            li.classList.toggle('active', i === index);
        });
        els.lessonContent.innerHTML = LESSONS[index].content;

        // Bind demo buttons
        els.lessonContent.querySelectorAll('.lesson-demo-btn').forEach(btn => {
            btn.addEventListener('click', () => _runLessonDemo(Number(btn.dataset.lesson)));
        });
    }

    function _runLessonDemo(lessonIndex) {
        // All lesson demos load the simple6 scenario and optionally auto-step
        els.scenarioSelect.value = 'simple6';
        els.scenarioSelect.dispatchEvent(new Event('change'));

        if (lessonIndex === 4) {
            // Auto run a few steps
            setTimeout(() => {
                els.btnRun.click();
            }, 400);
        }
    }

    /* ═════════════ PSEUDOCODE ═════════════ */
    function _initPseudocode() {
        const lines = Dijkstra.getPseudocode();
        els.pseudocodeEl.innerHTML = lines.map((line, i) =>
            `<span class="line" data-line="${i}">${_escapeHtml(line) || ' '}</span>`
        ).join('');
    }

    function highlightPseudocodeLine(lineIndex) {
        els.pseudocodeEl.querySelectorAll('.line').forEach((el, i) => {
            el.classList.toggle('active', i === lineIndex);
        });
    }

    /* ═════════════ TOOLBAR ═════════════ */
    function _bindToolbar() {
        // Mode buttons
        els.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setMode(btn.dataset.mode);
            });
        });

        // Directed toggle
        els.toggleDirected.addEventListener('change', () => {
            Graph.setDirected(els.toggleDirected.checked);
            els.toggleTrack.setAttribute('aria-checked', els.toggleDirected.checked);
        });
        els.toggleTrack.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                els.toggleDirected.checked = !els.toggleDirected.checked;
                els.toggleDirected.dispatchEvent(new Event('change'));
            }
        });

        // Scenario select
        els.scenarioSelect.addEventListener('change', () => {
            const key = els.scenarioSelect.value;
            if (!key) return;
            const data = Scenarios.get(key);
            if (!data) return;
            _resetAlgorithm();
            Graph.loadGraph(data);
            els.toggleDirected.checked = data.directed;
            els.toggleTrack.setAttribute('aria-checked', data.directed);
            _refreshNodeSelects();
            if (data.suggestedStart != null) els.startNode.value = data.suggestedStart;
            if (data.suggestedTarget != null) els.targetNode.value = data.suggestedTarget;
            _validateGraph();
        });

        // Error dismiss
        els.btnDismissError.addEventListener('click', () => {
            els.errorBanner.hidden = true;
        });
    }

    function setMode(mode) {
        currentMode = mode;
        edgeSourceNode = null;
        els.modeButtons.forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('btn--active', isActive);
            btn.setAttribute('aria-checked', isActive);
        });
    }

    function getMode() { return currentMode; }

    /* ═════════════ ALGORITHM CONTROLS ═════════════ */
    function _bindAlgoControls() {
        els.btnRun.addEventListener('click', _onRun);
        els.btnStep.addEventListener('click', _onStep);
        els.btnBack.addEventListener('click', _onBack);
        els.btnPlayPause.addEventListener('click', _onPlayPause);
        els.btnReset.addEventListener('click', _onReset);
    }

    function _onRun() {
        if (Dijkstra.getIsRunning()) return;
        const nodes = Graph.getNodes();
        if (nodes.length === 0) { _showError('Add some nodes first!'); return; }
        if (Graph.hasNegativeWeights()) { _showError('Cannot run: negative edge weights detected.'); return; }

        const startId = Number(els.startNode.value);
        if (isNaN(startId)) { _showError('Select a start node.'); return; }

        const targetVal = els.targetNode.value;
        const targetId = targetVal ? Number(targetVal) : null;

        Dijkstra.init(nodes, startId, targetId);
        _applySnapshot(Dijkstra.getCurrentSnapshot());

        els.btnRun.disabled = true;
        els.btnStep.disabled = false;
        els.btnPlayPause.disabled = false;
        els.btnBack.disabled = true;
        setMode('select');
        _disableGraphEditing(true);
    }

    function _onStep() {
        if (!Dijkstra.getIsRunning()) return;
        const snap = Dijkstra.step();
        if (snap) _applySnapshot(snap);
        _updateControlStates();
    }

    function _onBack() {
        if (!Dijkstra.getIsRunning()) return;
        const snap = Dijkstra.back();
        if (snap) _applySnapshot(snap);
        _updateControlStates();
    }

    function _onPlayPause() {
        if (isPlaying) {
            _stopAutoplay();
        } else {
            _startAutoplay();
        }
    }

    function _startAutoplay() {
        isPlaying = true;
        els.btnPlayPause.textContent = '⏸ Pause';
        _autoStep();
    }

    function _stopAutoplay() {
        isPlaying = false;
        els.btnPlayPause.textContent = '⏵ Play';
        clearTimeout(autoplayTimer);
    }

    function _autoStep() {
        if (!isPlaying || !Dijkstra.getIsRunning() || Dijkstra.getIsFinished()) {
            _stopAutoplay();
            return;
        }
        _onStep();
        const speed = Number(els.speedSlider.value);
        const delay = 1800 - (speed - 1) * 170;  // 1800ms (slow) to 270ms (fast)
        autoplayTimer = setTimeout(_autoStep, delay);
    }

    function _onReset() {
        _resetAlgorithm();
    }

    function _resetAlgorithm() {
        _stopAutoplay();
        Dijkstra.reset();
        Graph.clearAllVisualStates();
        _clearPanels();
        els.btnRun.disabled = false;
        els.btnStep.disabled = true;
        els.btnBack.disabled = true;
        els.btnPlayPause.disabled = true;
        els.btnPlayPause.textContent = '⏵ Play';
        els.stepK.textContent = '0';
        _disableGraphEditing(false);
        _validateGraph();
        _initPseudocode();
    }

    function _updateControlStates() {
        const idx = Dijkstra.getStepIndex();
        els.btnBack.disabled = idx <= 0;
        els.btnStep.disabled = Dijkstra.getIsFinished();
        if (Dijkstra.getIsFinished()) _stopAutoplay();
    }

    function _disableGraphEditing(disabled) {
        els.modeButtons.forEach(btn => {
            if (btn.dataset.mode !== 'select') btn.disabled = disabled;
        });
        els.toggleDirected.disabled = disabled;
        els.scenarioSelect.disabled = disabled;
    }

    /* ═════════════ APPLY SNAPSHOT ═════════════ */
    function _applySnapshot(snap) {
        if (!snap) return;

        els.stepK.textContent = snap.step;

        // Update node visual states
        const nodes = Graph.getNodes();
        for (const n of nodes) {
            if (snap.currentNode === n.id) {
                Graph.setNodeVisualState(n.id, 'current');
            } else if (snap.finalized[n.id]) {
                Graph.setNodeVisualState(n.id, 'finalized');
            } else if (snap.updatedNodes && snap.updatedNodes.includes(n.id)) {
                Graph.setNodeVisualState(n.id, 'updated');
            } else if (snap.pq.some(item => item.node === n.id) && !snap.finalized[n.id]) {
                Graph.setNodeVisualState(n.id, 'inqueue');
            } else {
                Graph.setNodeVisualState(n.id, 'unvisited');
            }
            // Distance label on node
            Graph.setNodeDistLabel(n.id, snap.dist[n.id]);
        }

        // Edge visual states
        Graph.getEdges().forEach(e => {
            if (snap.relaxedEdges && snap.relaxedEdges.includes(e.id)) {
                Graph.setEdgeVisualState(e.id, 'relaxing');
            } else if (snap.shortestPath) {
                // Highlight path edges
                const path = snap.shortestPath;
                let onPath = false;
                for (let i = 0; i < path.length - 1; i++) {
                    if ((e.from === path[i] && e.to === path[i + 1]) ||
                        (!Graph.isDirected() && e.from === path[i + 1] && e.to === path[i])) {
                        onPath = true; break;
                    }
                }
                Graph.setEdgeVisualState(e.id, onPath ? 'on-path' : null);
                // Also mark path nodes
                if (onPath) {
                    Graph.setNodeVisualState(e.from, 'on-path');
                    Graph.setNodeVisualState(e.to, 'on-path');
                }
            } else {
                Graph.setEdgeVisualState(e.id, null);
            }
        });

        // If path found, mark path nodes
        if (snap.shortestPath) {
            snap.shortestPath.forEach(nId => Graph.setNodeVisualState(nId, 'on-path'));
        }

        // Update panels
        _updateDistTable(snap, nodes);
        _updateVisitedChips(snap, nodes);
        _updatePriorityQueue(snap);
        highlightPseudocodeLine(snap.pseudocodeLine);
    }

    /* ═════════════ PANEL UPDATES ═════════════ */
    function _updateDistTable(snap, nodes) {
        let html = '';
        for (const n of nodes) {
            const distVal = snap.dist[n.id];
            const distStr = distVal === Infinity ? '<span class="infinity">∞</span>' : distVal;
            const prevNode = snap.prev[n.id];
            const prevStr = prevNode != null ? (Graph.getNode(prevNode)?.label || prevNode) : '—';
            const cls = snap.currentNode === n.id ? 'highlight' :
                (snap.updatedNodes && snap.updatedNodes.includes(n.id) ? 'updated' : '');
            html += `<tr class="${cls}"><td>${n.label}</td><td>${distStr}</td><td>${prevStr}</td></tr>`;
        }
        els.distTableBody.innerHTML = html;
    }

    function _updateVisitedChips(snap, nodes) {
        let html = '';
        for (const n of nodes) {
            if (snap.finalized[n.id]) {
                html += `<span class="chip">${n.label}</span>`;
            }
        }
        els.visitedChips.innerHTML = html || '<span style="color:var(--text-muted);font-size:var(--fs-xs)">None yet</span>';
    }

    function _updatePriorityQueue(snap) {
        // Sort PQ for display
        const sorted = [...snap.pq]
            .filter(item => !snap.finalized[item.node])
            .sort((a, b) => a.dist - b.dist);

        if (sorted.length === 0) {
            els.pqList.innerHTML = '<li style="color:var(--text-muted)">Empty</li>';
            return;
        }
        els.pqList.innerHTML = sorted.map(item => {
            const label = Graph.getNode(item.node)?.label || item.node;
            return `<li><span class="pq-node">${label}</span><span class="pq-dist">${item.dist}</span></li>`;
        }).join('');
    }

    function _clearPanels() {
        els.distTableBody.innerHTML = '';
        els.visitedChips.innerHTML = '<span style="color:var(--text-muted);font-size:var(--fs-xs)">None yet</span>';
        els.pqList.innerHTML = '<li style="color:var(--text-muted)">Empty</li>';
    }

    /* ═════════════ NODE SELECTS ═════════════ */
    function refreshNodeSelects() { _refreshNodeSelects(); }

    function _refreshNodeSelects() {
        const nodes = Graph.getNodes();
        const startVal = els.startNode.value;
        const targetVal = els.targetNode.value;

        els.startNode.innerHTML = '';
        els.targetNode.innerHTML = '<option value="">(any)</option>';

        for (const n of nodes) {
            const opt1 = document.createElement('option');
            opt1.value = n.id; opt1.textContent = n.label;
            els.startNode.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = n.id; opt2.textContent = n.label;
            els.targetNode.appendChild(opt2);
        }

        // Restore selection if possible
        if (nodes.find(n => n.id === Number(startVal))) els.startNode.value = startVal;
        if (nodes.find(n => n.id === Number(targetVal))) els.targetNode.value = targetVal;
    }

    /* ═════════════ VALIDATION ═════════════ */
    function validateGraph() { _validateGraph(); }

    function _validateGraph() {
        if (Graph.hasNegativeWeights()) {
            _showError('Negative edge weight detected. Dijkstra requires all weights ≥ 0.');
            els.btnRun.disabled = true;
        } else {
            els.errorBanner.hidden = true;
            if (!Dijkstra.getIsRunning()) els.btnRun.disabled = false;
        }
    }

    /* ═════════════ ERRORS ═════════════ */
    function _showError(msg) {
        els.errorMsg.textContent = msg;
        els.errorBanner.hidden = false;
    }

    /* ═════════════ SIDEBARS ─── */
    function _bindSidebars() {
        els.btnLessonToggle.addEventListener('click', () => {
            els.lessonSidebar.classList.toggle('collapsed');
        });
        els.btnCloseLesson.addEventListener('click', () => {
            els.lessonSidebar.classList.add('collapsed');
        });
        els.btnPanelsToggle.addEventListener('click', () => {
            els.panelsSidebar.classList.toggle('collapsed');
        });
    }

    /* ═════════════ EDGE DIALOG ═════════════ */
    function _bindEdgeDialog() {
        // Dialog close handler for backdrop click
        els.edgeDialog.addEventListener('click', (e) => {
            if (e.target === els.edgeDialog) els.edgeDialog.close();
        });
    }

    let _edgeDialogAC = null; // AbortController for edge dialog listeners

    function showEdgeDialog(fromId, toId) {
        // Abort previous listeners if any
        if (_edgeDialogAC) _edgeDialogAC.abort();
        _edgeDialogAC = new AbortController();
        const signal = _edgeDialogAC.signal;

        els.edgeWeightInput.value = 1;
        els.edgeDialog.showModal();
        els.edgeWeightInput.focus();

        els.edgeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const weight = Number(els.edgeWeightInput.value);
            els.edgeDialog.close();
            Graph.addEdge(fromId, toId, weight);
            _refreshNodeSelects();
            _validateGraph();
            _edgeDialogAC.abort();
        }, { signal });

        els.btnCancelEdge.addEventListener('click', () => {
            els.edgeDialog.close();
            _edgeDialogAC.abort();
        }, { signal });
    }

    function getEdgeSourceNode() { return edgeSourceNode; }
    function setEdgeSourceNode(id) { edgeSourceNode = id; }

    /* ═════════════ ACCESSIBILITY ═════════════ */
    function _bindAccessibility() {
        // Space/Enter on toggle switch
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (els.edgeDialog.open) els.edgeDialog.close();
            }
        });
    }

    /* ═════════════ HELPERS ═════════════ */
    function _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ═════════════ EXPOSE ═════════════ */
    return {
        init,
        setMode, getMode,
        refreshNodeSelects, validateGraph,
        showEdgeDialog,
        getEdgeSourceNode, setEdgeSourceNode,
        highlightPseudocodeLine,
    };
})();
