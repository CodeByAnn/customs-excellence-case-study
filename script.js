const scenes = {
    flow: {
        kicker: "01 / Document flow",
        title: "Customs team needs all shipment documents in one controlled flow.",
        body: "All the customs documents should be connected into one flow before the shipment reaches clearance. Each document has a different role, and mismatches between them are the early warning signal.",
        stat: "5",
        statLabel: "linked checkpoints"
    },
    logic: {
        kicker: "02 / Control logic",
        title: "Track data quality, compliance risk and business impact.",
        body: "The goal is to highlight the issues that affect control, risk and business impact.",
        stat: "3",
        statLabel: "control layers"
    },
    score: {
        kicker: "03 / Risk score",
        title: "Risk scoring helps the team focus where action matters most.",
        body: "Customs Risk Score combines:\ndocument mismatch,\nfinancial exposure,\ncompliance sensitivity,\nclearance impact,\nand repeated issue patterns.",
        stat: "1",
        statLabel: "prioritized score"
    },
    views: {
        kicker: "04 / Dashboard views",
        title: "Each stakeholder gets the view they need.",
        body: "Executive, data quality, exceptions, compliance and finance views answer different questions from one trusted data model (one source of truth).",
        stat: "5",
        statLabel: "dashboard views"
    },
    roadmap: {
        kicker: "05 / Future capabilities",
        title: "Build trust first. Automate what is controlled. Predict what is understood.",
        body: "Once the data foundation is reliable, Customs can move from visibility to control, then to targeted automation and predictive risk signals.",
        stat: "4",
        statLabel: "roadmap stages"
    }
};

const palette = {
    ink: "#0c0c0c",
    muted: "#5e5e58",
    blue: "#74cbe2",
    mint: "#7bd99e",
    lime: "#c9f36a",
    clay: "#efa25f",
    rose: "#ee8aae",
    soft: "#f4f3ef",
    paper: "#ffffff"
};

const heroNodes = [
    { id: "po", label: "Purchase Orders (PO)", x: 0.18, y: 0.28, color: palette.blue, labelSide: "top" },
    { id: "ic", label: "Intercompany Invoices (IC)", x: 0.82, y: 0.28, color: palette.clay, labelSide: "top" },
    { id: "ci", label: "Commercial Invoices (CI)", x: 0.20, y: 0.75, color: palette.mint, labelSide: "bottom" },
    { id: "cd", label: "Customs Declarations (CD)", x: 0.82, y: 0.75, color: palette.rose, labelSide: "bottom" },
    { id: "tower", label: "CONTROL", sub: "TOWER", x: 0.53, y: 0.51, color: palette.lime, core: true }
];

const flowNodes = [
    { label: "PO", full: "Purchase Orders", color: palette.blue },
    { label: "CI", full: "Commercial Invoices", color: palette.mint },
    { label: "IC", full: "Intercompany Invoices", color: palette.clay },
    { label: "CD", full: "Customs Declarations", color: palette.rose },
    { label: "Clearance", full: "Operational Outcome", color: palette.lime, dark: true }
];

const logicColumns = [
    {
        title: "Data Quality",
        items: ["Completeness", "Availability", "Duplicates", "Late documents"]
    },
    {
        title: "Compliance Risk",
        items: ["HS code", "Origin", "Value", "Quantity", "Declaration accuracy"]
    },
    {
        title: "Operational / Financial Impact",
        items: ["Delay", "Manual review", "Duty variance", "Broker response", "Audit readiness"]
    }
];

const riskParts = [
    "Mismatch severity",
    "Financial exposure",
    "Compliance sensitivity",
    "Delay impact",
    "Repeat issue pattern"
];

const priorityLevels = [
    { label: "Low", value: "0-39", fill: "#eaf8ef", stroke: palette.mint, ink: palette.ink },
    { label: "Medium", value: "40-69", fill: "#effbd5", stroke: palette.lime, ink: palette.ink },
    { label: "High", value: "70-89", fill: "#fff0df", stroke: palette.clay, ink: palette.ink },
    { label: "Critical", value: "90+", fill: "#fde5ee", stroke: palette.rose, ink: palette.ink }
];

const dashboardViews = [
    { letter: "A", label: "Executive", q: "Are we in control?", color: palette.blue },
    { letter: "B", label: "Data Quality", q: "Can we trust the data?", color: palette.mint },
    { letter: "C", label: "Exceptions", q: "What needs action now?", color: palette.rose },
    { letter: "D", label: "Compliance", q: "Where is risk increasing?", color: palette.clay },
    { letter: "E", label: "Finance", q: "Where is cost exposure?", color: palette.lime }
];

const roadmap = [
    { label: "Visibility", sub: "document completeness and matching", color: palette.blue },
    { label: "Control", sub: "exception ownership and audit evidence", color: palette.mint },
    { label: "Automation", sub: "AI-assisted validation and routing", color: palette.clay },
    { label: "Prediction", sub: "early warnings for delays and duty exposure", color: palette.rose }
];

function chartBase(selector, options = {}) {
    const container = d3.select(selector);
    container.selectAll("*").remove();
    const width = Math.max(320, container.node().clientWidth);
    const height = options.height || Math.max(430, Math.min(640, Math.round(width * 0.72)));
    const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
    return { svg, width, height };
}

function drawHeroNetwork() {
    const { svg, width, height } = chartBase("#hero-network", { height: 620 });
    drawControlNetwork(svg, width, height, true);
}

function drawControlNetwork(svg, width, height, large = false) {
    const compact = width < 520;
    const compactHeroPositions = {
        po: { x: 0.25, y: 0.29 },
        ic: { x: 0.75, y: 0.29 },
        ci: { x: 0.25, y: 0.74 },
        cd: { x: 0.75, y: 0.74 },
        tower: { x: 0.5, y: 0.51 }
    };
    const nodes = heroNodes.map(d => {
        const override = compact && large ? compactHeroPositions[d.id] : null;
        return {
            ...d,
            x: (override?.x ?? d.x) * width,
            y: (override?.y ?? d.y) * height
        };
    });
    const tower = nodes.find(d => d.core);
    const sources = nodes.filter(d => !d.core);
    const line = d3.line().curve(d3.curveBasis);

    sources.forEach((source, index) => {
        const points = [
            [source.x, source.y],
            [(source.x + tower.x) / 2, source.y + (source.y < tower.y ? -34 : 34)],
            [tower.x, tower.y]
        ];

        svg.append("path")
            .attr("id", `network-path-${large ? "hero" : "scene"}-${index}`)
            .attr("d", line(points))
            .attr("fill", "none")
            .attr("stroke", source.color)
            .attr("stroke-width", large ? 2.2 : 1.8)
            .attr("stroke-opacity", 0.42);

        svg.append("circle")
            .attr("r", large ? 6 : 4)
            .attr("fill", source.color)
            .attr("opacity", 0.9)
            .append("animateMotion")
            .attr("dur", `${3.4 + index * 0.3}s`)
            .attr("begin", `${index * 0.2}s`)
            .attr("repeatCount", "indefinite")
            .append("mpath")
            .attr("href", `#network-path-${large ? "hero" : "scene"}-${index}`);
    });

    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("r", d => d.core ? (large ? 70 : 58) : (large ? 48 : 34))
        .attr("fill", d => d.core ? "rgba(255,255,255,0.12)" : d3.color(d.color).copy({ opacity: 0.16 }))
        .attr("stroke", d => d.core ? palette.ink : d.color)
        .attr("stroke-width", d => d.core ? 3 : 2)
        .attr("stroke-opacity", d => d.core ? 0.95 : 0.85);

    node.filter(d => !d.core)
        .append("circle")
        .attr("r", d => large ? 24 : 16)
        .attr("fill", "none")
        .attr("stroke", d => d.color)
        .attr("stroke-width", 1.4)
        .attr("stroke-opacity", 0.22)
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", large ? "24;36;24" : "16;25;16")
        .attr("dur", "3.4s")
        .attr("repeatCount", "indefinite");

    node.append("circle")
        .attr("r", d => d.core ? 14 : 8)
        .attr("fill", d => d.core ? palette.ink : d.color)
        .attr("opacity", d => d.core ? 1 : 0.95);

    sources.forEach(d => {
        const radius = large ? 48 : 34;
        const labelFont = large ? (compact ? 11.3 : 17) : 11;
        const labelY = d.labelSide === "top"
            ? d.y - radius - (large ? (compact ? 22 : 26) : 18)
            : d.y + radius + (large ? (compact ? 46 : 58) : 34);

        svg.append("text")
            .attr("x", d.x)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("fill", palette.ink)
            .attr("font-size", labelFont)
            .attr("font-weight", 950)
            .attr("letter-spacing", "-0.035em")
            .text(d.label);
    });

    svg.append("text")
        .attr("x", tower.x)
        .attr("y", tower.y - (large ? 88 : 70))
        .attr("text-anchor", "middle")
        .attr("font-size", large ? 34 : 20)
        .attr("font-weight", 950)
        .attr("fill", palette.ink)
        .text("CONTROL");

    svg.append("text")
        .attr("x", tower.x)
        .attr("y", tower.y + (large ? 104 : 84))
        .attr("text-anchor", "middle")
        .attr("font-size", large ? 34 : 20)
        .attr("font-weight", 950)
        .attr("fill", palette.ink)
        .text("TOWER");
}

function drawScene(sceneKey) {
    const visual = d3.select("#scene-visual");
    visual.classed("is-redrawing", true);
    const { svg, width, height } = chartBase("#scene-visual");
    if (sceneKey === "flow") drawDocumentFlow(svg, width, height);
    if (sceneKey === "logic") drawControlLogic(svg, width, height);
    if (sceneKey === "score") drawRiskScore(svg, width, height);
    if (sceneKey === "views") drawDashboardViews(svg, width, height);
    if (sceneKey === "roadmap") drawRoadmap(svg, width, height);
    window.setTimeout(() => {
        visual.classed("is-redrawing", false);
    }, 90);
}

function drawDocumentFlow(svg, width, height) {
    const compact = width < 520;
    const centerX = compact ? width * 0.34 : width * 0.34;
    const labelX = compact ? centerX + 82 : centerX + 138;
    const top = compact ? 42 : 46;
    const bottom = height - (compact ? 86 : 46);
    const step = (bottom - top) / (flowNodes.length - 1);

    flowNodes.forEach((d, i) => {
        const delay = i * 320;
        const x = centerX;
        const yy = top + i * step;
        const radius = d.dark ? (compact ? 44 : 66) : (compact ? 36 : 55);

        if (i > 0) {
            const prevX = centerX;
            const prevY = top + (i - 1) * step;
            const link = svg.append("line")
                .attr("x1", prevX)
                .attr("y1", prevY)
                .attr("y2", prevY)
                .attr("x2", prevX)
                .attr("stroke", d.color)
                .attr("stroke-width", 3)
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 0.42);
            link.transition()
                .delay(delay - 120)
                .duration(740)
                .attr("x2", x)
                .attr("y2", yy);
        }

        const group = svg.append("g")
            .attr("opacity", 0)
            .attr("transform", `translate(${x},${yy + 8})`);

        group.transition()
            .delay(delay)
            .duration(720)
            .attr("opacity", 1)
            .attr("transform", `translate(${x},${yy})`);

        group.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 0)
            .attr("fill", d.dark ? palette.ink : d3.color(d.color).copy({ opacity: 0.16 }))
            .attr("stroke", d.dark ? palette.ink : d.color)
            .attr("stroke-width", d.dark ? 0 : 3)
            .transition()
            .delay(delay)
            .duration(760)
            .attr("r", radius);

        group.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radius + 11)
            .attr("fill", "none")
            .attr("stroke", d.color)
            .attr("stroke-width", 1.4)
            .attr("stroke-opacity", 0.15);

        group.append("text")
            .attr("x", 0)
            .attr("y", d.dark ? 5 : 6)
            .attr("text-anchor", "middle")
            .attr("fill", d.dark ? "#ffffff" : palette.ink)
            .attr("font-size", d.dark ? (compact ? 10.5 : 16) : (compact ? 17 : 27))
            .attr("font-weight", 950)
            .text(d.label);

        group.append("text")
            .attr("x", labelX - x)
            .attr("y", 5)
            .attr("text-anchor", "start")
            .attr("fill", "#4c4c47")
            .attr("font-size", compact ? 14 : 21)
            .attr("font-weight", 900)
            .attr("letter-spacing", "-0.02em")
            .text(d.full);
    });
}

function drawControlLogic(svg, width, height) {
    const compact = width < 520;
    const colors = [palette.blue, palette.mint, palette.rose];
    const baseCards = logicColumns.map((col, i) => ({ ...col, color: colors[i] }));
    const cardW = width - (compact ? 34 : 64);
    const gap = compact ? 18 : 24;
    const cardH = Math.max(compact ? 104 : 150, Math.min(compact ? 124 : 174, (height - 42 - gap * 2) / 3));
    const startY = Math.max(compact ? 10 : 20, (height - (cardH * 3 + gap * 2)) / 2);
    const layouts = baseCards.map((_, i) => ({
        x: (width - cardW) / 2,
        y: startY + i * (cardH + gap),
        w: cardW,
        h: cardH
    }));

    const chainGroup = svg.append("g").attr("class", "logic-chain");
    const chainX = layouts[0].x + layouts[0].w - (compact ? 26 : 34);
    const chainPoints = layouts.map(card => [chainX, card.y + (compact ? 22 : 28)]);
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.6));
    chainGroup.append("path")
        .attr("d", line(chainPoints))
        .attr("fill", "none")
        .attr("stroke", palette.ink)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.1)
        .attr("stroke-linecap", "round");

    chainGroup.selectAll("path").each(function(_, index) {
        const path = d3.select(this);
        const length = this.getTotalLength();
        path.attr("stroke-dasharray", `${length} ${length}`)
            .attr("stroke-dashoffset", length)
            .transition()
            .delay(240 + index * 160)
            .duration(1100)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0);
    });

    const groups = svg.selectAll("g.logic-card")
        .data(baseCards.map((card, i) => ({ ...card, ...layouts[i], order: i })))
        .join("g")
        .attr("class", "logic-card")
        .attr("opacity", 0)
        .attr("transform", d => `translate(${d.x},${d.y + 22})`)
        .style("pointer-events", "none");

    groups.transition()
        .delay((_, i) => 220 + i * 280)
        .duration(720)
        .attr("opacity", 1)
        .attr("transform", d => `translate(${d.x},${d.y})`);

    groups.append("rect")
        .attr("class", "logic-tile")
        .attr("width", d => d.w)
        .attr("height", d => d.h)
        .attr("rx", compact ? 18 : 22)
        .attr("fill", d => d3.color(d.color).copy({ opacity: 0.14 }))
        .attr("stroke", d => d.color)
        .attr("stroke-width", 2.4);

    groups.append("circle")
        .attr("cx", d => d.w - (compact ? 24 : 32))
        .attr("cy", compact ? 24 : 32)
        .attr("r", compact ? 9 : 11)
        .attr("fill", d => d.color)
        .attr("opacity", 0.95);

    groups.each(function(card) {
        const group = d3.select(this);
        const title = group
            .append("text")
            .attr("x", card.w / 2)
            .attr("y", compact ? 28 : 44)
            .attr("text-anchor", "middle")
            .attr("fill", palette.ink)
            .attr("font-size", card.title.length > 20 ? (compact ? 13 : 20) : (compact ? 16 : 25))
            .attr("font-weight", 950)
            .attr("letter-spacing", "-0.055em");
        if (compact) {
            title.text(card.title);
        } else {
            typeSvgText(title, card.title, 720 + card.order * 420, 24);
        }

        const itemPositions = getLogicItemPositions(card.items, card.w, compact);
        group.selectAll("text.logic-item")
            .data(card.items.map((item, index) => ({ item, ...itemPositions[index], index })))
            .join("text")
            .attr("class", "logic-item")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", "middle")
            .attr("fill", "#5c5c56")
            .attr("font-size", compact ? 11 : 14)
            .attr("font-weight", 830)
            .attr("letter-spacing", "-0.015em")
            .attr("opacity", 0)
            .attr("transform", d => {
                const start = entryOffset(d.index);
                return `translate(${start.x},${start.y})`;
            })
            .text(d => d.item)
            .transition()
            .delay(d => 1040 + card.order * 310 + d.index * 170)
            .duration(860)
            .ease(d3.easeBackOut.overshoot(1.12))
            .attr("opacity", 1)
            .attr("transform", "translate(0,0)");
    });

    function entryOffset(index) {
        const offsets = [
            { x: 0, y: -34 },
            { x: 42, y: 0 },
            { x: -42, y: 0 },
            { x: 0, y: 34 },
            { x: 34, y: 26 }
        ];
        return offsets[index % offsets.length];
    }

    function getLogicItemPositions(items, cardWidth, isCompact) {
        const startY = isCompact ? 58 : 86;
        const rowGap = isCompact ? 21 : 30;
        if (items.length === 4) {
            return [
                { x: cardWidth * 0.28, y: startY },
                { x: cardWidth * 0.72, y: startY },
                { x: cardWidth * 0.28, y: startY + rowGap },
                { x: cardWidth * 0.72, y: startY + rowGap }
            ];
        }
        return [
            { x: cardWidth * 0.22, y: startY },
            { x: cardWidth * 0.5, y: startY },
            { x: cardWidth * 0.78, y: startY },
            { x: cardWidth * 0.34, y: startY + rowGap },
            { x: cardWidth * 0.66, y: startY + rowGap }
        ];
    }
}

function typeSvgText(textSelection, phrase, delay = 0, speed = 24) {
    textSelection.text("");
    phrase.split("").forEach((_, index) => {
        setTimeout(() => {
            const node = textSelection.node();
            if (node?.isConnected) textSelection.text(phrase.slice(0, index + 1));
        }, delay + index * speed);
    });
}

function drawRiskScore(svg, width, height) {
    const compact = width < 700;
    const narrow = width < 520;
    const centerX = compact ? width * 0.5 : width * 0.52;
    const centerY = narrow ? height * 0.28 : compact ? height * 0.4 : height * 0.43;
    const riskColors = [palette.clay, palette.mint, palette.clay, palette.rose, palette.lime];
    const coreR = narrow ? 72 : compact ? 82 : 126;
    const chipW = narrow ? Math.min(154, width * 0.43) : compact ? 154 : 202;
    const chipH = narrow ? 30 : compact ? 32 : 34;
    const margin = compact ? 12 : 20;
    const ringR = coreR * 1.32;

    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", coreR)
        .attr("fill", "rgba(255,255,255,0.7)")
        .attr("stroke", palette.ink)
        .attr("stroke-width", compact ? 2.2 : 2.8);

    svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", ringR)
        .attr("fill", "none")
        .attr("stroke", palette.ink)
        .attr("stroke-width", 1.2)
        .attr("stroke-opacity", 0.08)
        .attr("stroke-dasharray", "5 14");

    ["Customs", "Risk", "Score"].forEach((line, index) => {
        svg.append("text")
            .attr("x", centerX)
            .attr("y", centerY + (index - 1) * (compact ? 27 : 38) + (compact ? 8 : 12))
            .attr("text-anchor", "middle")
            .attr("font-size", narrow ? 21 : compact ? 25 : 36)
            .attr("font-weight", 950)
            .attr("letter-spacing", "-0.06em")
            .text(line);
    });

    const factorGroup = svg.append("g");
    const ringOverlap = compact ? 8 : 10;
    const chipPositions = narrow ? (() => {
        const leftX = width * 0.28;
        const rightX = width * 0.72;
        const topY = centerY + coreR + 38;
        const bottomY = topY + 42;
        return [
            { x: centerX, y: centerY - coreR - 26 },
            { x: rightX, y: topY },
            { x: rightX, y: bottomY },
            { x: leftX, y: bottomY },
            { x: leftX, y: topY }
        ];
    })() : (() => {
        const sideY = ringR * 0.56;
        const coreEdgeX = Math.sqrt((coreR * coreR) - (sideY * sideY));
        const chipGap = compact ? 22 : 30;
        const sideX = coreEdgeX + chipGap + chipW / 2;
        const topY = ringR - ringOverlap + chipH / 2;
        return [
            { x: centerX, y: centerY - topY },
            { x: centerX + sideX, y: centerY - sideY },
            { x: centerX + sideX, y: centerY + sideY },
            { x: centerX - sideX, y: centerY + sideY },
            { x: centerX - sideX, y: centerY - sideY }
        ];
    })();
    riskParts.forEach((part, i) => {
        const pos = chipPositions[i];
        const x = clamp(pos.x, margin + chipW / 2, width - margin - chipW / 2);
        const y = clamp(pos.y, margin + chipH / 2, height - margin - chipH / 2 - (compact ? 62 : 46));
        const color = riskColors[i];
        const chip = factorGroup.append("g")
            .attr("opacity", 0)
            .attr("transform", `translate(${x - chipW / 2},${y - chipH / 2 + 10})`);

        chip.transition()
            .delay(240 + i * 180)
            .duration(640)
            .attr("opacity", 1)
            .attr("transform", `translate(${x - chipW / 2},${y - chipH / 2})`);

        chip.append("rect")
            .attr("width", chipW)
            .attr("height", chipH)
            .attr("rx", chipH / 2)
            .attr("fill", d3.color(color).copy({ opacity: 0.16 }))
            .attr("stroke", color)
            .attr("stroke-width", 1.6);

        chip.append("circle")
            .attr("cx", 18)
            .attr("cy", chipH / 2)
            .attr("r", 5.5)
            .attr("fill", color);

        chip.append("text")
            .attr("x", 32)
            .attr("y", chipH / 2 + 4)
            .attr("font-size", part.length > 20 ? (narrow ? 7.8 : compact ? 8.8 : 10) : (narrow ? 8.4 : compact ? 9.6 : 10.8))
            .attr("font-weight", 900)
            .attr("fill", palette.ink)
            .text(part);

        chip.append("animateTransform")
            .attr("attributeName", "transform")
            .attr("type", "translate")
            .attr("values", `${x - chipW / 2},${y - chipH / 2};${x - chipW / 2},${y - chipH / 2 - 6};${x - chipW / 2},${y - chipH / 2}`)
            .attr("dur", `${3.5 + i * 0.2}s`)
            .attr("begin", `${i * 0.15}s`)
            .attr("repeatCount", "indefinite");
    });

    const levelsY = height - (compact ? 44 : 36);
    const levelW = compact ? (width - 72) / 4 : 76;
    const levelsX = compact ? 36 : width - (priorityLevels.length * levelW) - 26;
    priorityLevels.forEach((level, i) => {
        const x = levelsX + i * levelW;
        const y = levelsY;
        svg.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", levelW - (compact ? 6 : 8))
            .attr("height", compact ? 24 : 24)
            .attr("rx", 7)
            .attr("fill", level.fill)
            .attr("stroke", level.stroke)
            .attr("stroke-width", 1.5);
        svg.append("text")
            .attr("x", x + (levelW - (compact ? 6 : 8)) / 2)
            .attr("y", y + (compact ? 16 : 16))
            .attr("fill", level.ink)
            .attr("text-anchor", "middle")
            .attr("font-size", compact ? 8 : 8.2)
            .attr("font-weight", 950)
            .text(level.label);
    });

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}

function drawDashboardViews(svg, width, height) {
    const compact = width < 720;
    const cardW = compact ? width - 42 : Math.min(width * 0.78, 660);
    const cardH = compact ? 58 : 66;
    const gap = compact ? 12 : 16;
    const startX = (width - cardW) / 2;
    const startY = Math.max(26, (height - (dashboardViews.length * cardH + (dashboardViews.length - 1) * gap)) / 2);
    const spineX = startX + (compact ? 28 : 36);
    const spineTop = startY + cardH / 2;
    const spineBottom = startY + (dashboardViews.length - 1) * (cardH + gap) + cardH / 2;

    const spine = svg.append("line")
        .attr("x1", spineX)
        .attr("x2", spineX)
        .attr("y1", spineTop)
        .attr("y2", spineTop)
        .attr("stroke", palette.ink)
        .attr("stroke-opacity", 0.12)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round");

    spine.transition()
        .duration(1450)
        .ease(d3.easeCubicOut)
        .attr("y2", spineBottom);

    dashboardViews.forEach((view, i) => {
        const x = startX;
        const y = startY + i * (cardH + gap);
        const group = svg.append("g")
            .attr("opacity", 0)
            .attr("transform", `translate(${x},${y + 16})`);

        group.transition()
            .delay(i * 230)
            .duration(620)
            .ease(d3.easeCubicOut)
            .attr("opacity", 1)
            .attr("transform", `translate(${x},${y})`);

        group.append("rect")
            .attr("width", cardW)
            .attr("height", cardH)
            .attr("rx", 15)
            .attr("fill", i === 0 ? palette.ink : d3.color(view.color).copy({ opacity: 0.16 }))
            .attr("stroke", i === 0 ? palette.ink : view.color)
            .attr("stroke-width", 2);

        group.append("circle")
            .attr("cx", compact ? 28 : 36)
            .attr("cy", cardH / 2)
            .attr("r", compact ? 13 : 15)
            .attr("fill", i === 0 ? "#ffffff" : d3.color(view.color).copy({ opacity: 0.22 }))
            .attr("stroke", i === 0 ? "#ffffff" : view.color)
            .attr("stroke-width", 2);

        group.append("text")
            .attr("x", compact ? 28 : 36)
            .attr("y", cardH / 2 + 5)
            .attr("text-anchor", "middle")
            .attr("fill", i === 0 ? palette.ink : palette.ink)
            .attr("font-size", compact ? 10 : 11)
            .attr("font-weight", 950)
            .text(view.letter);

        group.append("text")
            .attr("x", compact ? 56 : 70)
            .attr("y", cardH / 2 - 3)
            .attr("fill", i === 0 ? "#ffffff" : palette.ink)
            .attr("font-size", compact ? 15 : 18)
            .attr("font-weight", 950)
            .attr("letter-spacing", "-0.045em")
            .text(view.label);

        group.append("text")
            .attr("x", compact ? 56 : 70)
            .attr("y", cardH / 2 + 18)
            .attr("fill", i === 0 ? "#d8d8d3" : "#4c4c47")
            .attr("font-size", compact ? 10 : 11.5)
            .attr("font-weight", 830)
            .text(view.q);
    });
}

function drawRoadmap(svg, width, height) {
    const compact = width < 760;
    const margin = compact ? 54 : 80;
    const y = compact ? null : height * 0.5;
    const step = compact ? (height - 112) / (roadmap.length - 1) : (width - margin * 2) / (roadmap.length - 1);

    roadmap.forEach((stage, i) => {
        const x = compact ? Math.min(width * 0.34, 190) : margin + i * step;
        const yy = compact ? 58 + i * step : y;

        if (i > 0) {
            svg.append("line")
                .attr("x1", compact ? Math.min(width * 0.34, 190) : margin + (i - 1) * step)
                .attr("y1", compact ? 58 + (i - 1) * step : y)
                .attr("x2", compact ? Math.min(width * 0.34, 190) : margin + (i - 1) * step)
                .attr("y2", compact ? 58 + (i - 1) * step : y)
                .attr("stroke", stage.color)
                .attr("stroke-width", 3)
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 0.46)
                .transition()
                .delay(i * 130)
                .duration(480)
                .attr("x2", x)
                .attr("y2", yy);
        }

        svg.append("circle")
            .attr("cx", x)
            .attr("cy", yy)
            .attr("r", 0)
            .attr("fill", d3.color(stage.color).copy({ opacity: 0.22 }))
            .attr("stroke", stage.color)
            .attr("stroke-width", 3)
            .transition()
            .delay(i * 130)
            .duration(460)
            .attr("r", compact ? 26 : 35);

        svg.append("text")
            .attr("x", compact ? x + 52 : x)
            .attr("y", compact ? yy - 5 : yy - 64)
            .attr("text-anchor", compact ? "start" : "middle")
            .attr("font-size", compact ? 19 : 24)
            .attr("font-weight", 950)
            .attr("letter-spacing", "-0.04em")
            .text(stage.label);

        svg.append("text")
            .attr("x", compact ? x + 52 : x)
            .attr("y", compact ? yy + 15 : yy + 62)
            .attr("text-anchor", compact ? "start" : "middle")
            .attr("font-size", compact ? 10.5 : 12)
            .attr("font-weight", 850)
            .attr("fill", "#4c4c47")
            .text(stage.sub);
    });
}

function wrapSvgText(svg, text, x, y, width, lineHeight, fill) {
    appendWrappedText(svg, text, x, y, width, lineHeight, fill, 12, 820);
}

function appendWrappedText(svg, text, x, y, width, lineHeight, fill, fontSize = 12, fontWeight = 820, maxLines = Infinity) {
    const words = text.split(/\s+/);
    let line = [];
    let lineNumber = 0;
    const textEl = svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("fill", fill)
        .attr("font-size", fontSize)
        .attr("font-weight", fontWeight);
    let tspan = textEl.append("tspan").attr("x", x).attr("dy", 0);
    words.forEach(word => {
        if (lineNumber >= maxLines) return;
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
            line.pop();
            tspan.text(line.join(" "));
            if (lineNumber + 1 >= maxLines) {
                tspan.text(`${line.join(" ")}...`);
                lineNumber = maxLines;
                return;
            }
            line = [word];
            tspan = textEl.append("tspan")
                .attr("x", x)
                .attr("dy", lineHeight)
                .text(word);
            lineNumber += 1;
        }
    });
    return textEl;
}

function updateScene(sceneKey, index = 0) {
    const scene = scenes[sceneKey];
    if (!scene) return;
    document.querySelector("#scene-kicker").textContent = scene.kicker;
    document.querySelector("#scene-title").textContent = scene.title;
    document.querySelector("#scene-body").textContent = scene.body;
    document.querySelector("#scene-stat strong").textContent = scene.stat;
    document.querySelector("#scene-stat span").textContent = scene.statLabel;
    document.querySelector("#scene-progress").textContent = `${String(index + 1).padStart(2, "0")} / 05`;
    drawScene(sceneKey);
}

function setupScroll() {
    const steps = [...document.querySelectorAll(".step")];
    const observer = new IntersectionObserver(entries => {
        const visible = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const active = visible.target;
        steps.forEach(step => step.classList.toggle("is-active", step === active));
        updateScene(active.dataset.scene, steps.indexOf(active));
    }, {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-18% 0px -28% 0px"
    });
    steps.forEach(step => observer.observe(step));
}

drawHeroNetwork();
updateScene("flow", 0);
setupScroll();

let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        drawHeroNetwork();
        const active = document.querySelector(".step.is-active") || document.querySelector(".step");
        updateScene(active.dataset.scene, [...document.querySelectorAll(".step")].indexOf(active));
    }, 180);
});
