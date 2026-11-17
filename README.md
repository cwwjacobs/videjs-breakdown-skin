# Breakdown: A Video.js v10 Skin for Interactive Lessons & 2.5D Spatial Fields

> **Official Entry for the Video.js v10 Skins Design Challenge**  
> **Live Demo**: [https://cwwjacobs.github.io/videjs-breakdown-skin/](https://cwwjacobs.github.io/videjs-breakdown-skin/)  
> **Judged by**: Creators of Video.js and Plyr | **Sponsor**: Mux

![Breakdown Player Hero Screenshot](screenshot-player-hero.png)

---

## The Concept: From Passive Viewing to Active Exploration

Most video player skins assume passive consumption: controls float directly over the video, dimming the picture with dark gradient overlays whenever paused or hovered. 

In technical walkthroughs, systems architecture, and coding lessons, this model fails. When an engineer or student pauses a video, **the paused frame is precisely what they are studying—obscuring it breaks cognitive focus.**

**Breakdown** is a ground-up skin for the **Video.js v10** player that treats video as the guide for an **interactive learning canvas with a synchronized 2.5D spatial field underneath**.

---

## Key Innovations

### 1. Non-Obscuring Grounded Layout
Controls live entirely on a dedicated card **below** the video frame. The video card remains pristine and unobstructed, dynamically adapting to any aspect ratio (16:9, 4:3, 9:16) with no black bars and no hover overlays covering the picture.

### 2. Synchronized 2.5D Spatial Field Underneath
Positioned directly under and beside the player is an interactive spatial field:
- **2.5D Isometric Architecture**: Rendered with clean single-light shading, atmospheric depth color, and layered SVG/CSS (following the `2.5Dimension` doctrine)—zero bulky 3D engine overhead and instantaneous loading.
- **Dynamic Route & Entity Tracing**: As the video narrator explains network flows, token replays, or database queries, the 2.5D field illuminates the affected components and animates packet routes in real time.
- **Domain-Aware Mockups**: Interactive terminals, cloud identity consoles, security logs, and 2.5D boundary zones that update in lockstep with video playback.

### 3. Dual Playback Modes: Real-Time vs. Step-Pause
A dedicated player mode switch gives viewers control over their learning cadence:
- **Real-Time**: The spatial canvas and stage follow the video continuously.
- **Step-Pause**: The player automatically pauses at the end of each chapter, allowing the viewer to inspect the 2.5D architecture, test hypothesis cards, or solve checkpoints before continuing.

### 4. Chapter-Segmented Progress Rail
The seek rail is segmented into distinct chapter spans with start ticks, chapter numbers, and jumping controls, so the viewer always knows the structure of the lesson.

### 5. Universal Accessibility & Web Standards
- **Video.js v10 Native**: Built strictly on modern `@videojs/html` 10.4 custom elements (`@videojs/player`, `@videojs/media`, `@videojs/container`).
- **Full Keyboard Navigation**: Intuitive shortcuts (`K` play/pause, `M` mute, `F` fullscreen, `C` captions, `J`/`L` seek, `<`/`>` speed, chapter navigation).
- **Visible Contrast & Reduced Motion**: High contrast focus rings, large mobile thumb targets, and graceful simplification under `prefers-reduced-motion`.

---

## Live Interactive Lessons

Try the player across three fictional training scenarios:

1. [**Reason through an account compromise**](m1-account-compromise/index.html)  
   *Three signals on one account. Features the 2.5D estate world, identity console mockup, and investigation workflow.*
2. [**An authenticated request can still be unauthorized**](m2-api-authorization/index.html)  
   *Authentication vs. authorization. Features 2.5D boundary zones and API policy enforcement.*
3. [**Contain ransomware and prove recovery**](m3-ransomware-recovery/index.html)  
   *Evidence trade-offs and isolation. Features 2.5D estate recovery pathways and containment flow.*

---

## Open Source License

Licensed under the **Apache License, Version 2.0**.
