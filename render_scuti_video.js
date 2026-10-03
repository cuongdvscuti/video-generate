const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ffmpegPath = require('ffmpeg-static');

const outputDir = __dirname;
const framesDir = path.join(outputDir, 'frames');
const outputVideo = path.join(outputDir, 'scuti_ai_intro.mp4');
const fps = 30;
const durationSeconds = 16;
const totalFrames = durationSeconds * fps;

function makeHtml() {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Scuti AI Intro</title>
        <style>
          :root {
            --bg1: #050816;
            --bg2: #0d1227;
            --panel: rgba(14, 22, 38, 0.82);
            --panel-2: rgba(18, 30, 52, 0.9);
            --line: rgba(142, 172, 255, 0.28);
            --cyan: #76e7ff;
            --blue: #77a8ff;
            --violet: #9f8cff;
            --green: #8af0c1;
            --white: #edf7ff;
            --soft: rgba(255,255,255,0.86);
          }

          * { box-sizing: border-box; }

          html, body {
            margin: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 15% 20%, rgba(119, 168, 255, 0.15), transparent 25%),
                        radial-gradient(circle at 75% 30%, rgba(159, 140, 255, 0.12), transparent 30%),
                        linear-gradient(135deg, var(--bg1), var(--bg2) 50%, #0a0d1a 100%);
            font-family: Inter, Arial, sans-serif;
            overflow: hidden;
          }

          body {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
          }

          .scene {
            position: relative;
            width: 1920px;
            height: 1080px;
            overflow: hidden;
            background: radial-gradient(circle at 50% 50%, rgba(103, 123, 255, 0.12), transparent 38%);
          }

          .grid {
            position: absolute;
            inset: -20% -10%;
            background-image:
              linear-gradient(rgba(141, 170, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(141, 170, 255, 0.08) 1px, transparent 1px);
            background-size: 64px 64px;
            transform: perspective(900px) rotateX(63deg) scale(1.8);
            animation: drift 16s linear infinite alternate;
          }

          .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(30px);
            opacity: .75;
            animation: float 10s ease-in-out infinite alternate;
          }

          .glow.one { width: 520px; height: 520px; left: 12%; top: 18%; background: rgba(118, 231, 255, 0.2); }
          .glow.two { width: 620px; height: 620px; right: 10%; bottom: 12%; background: rgba(159, 140, 255, 0.18); animation-delay: 1.5s; }

          .logo {
            position: absolute;
            top: 58px;
            left: 86px;
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 5;
            animation: reveal 1s ease-out both;
          }

          .logo-mark {
            width: 28px; height: 28px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--cyan), var(--violet));
            box-shadow: 0 0 26px rgba(118, 231, 255, 0.8);
          }

          .logo-text {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(237, 247, 255, 0.9);
          }

          .orb-wrap {
            position: absolute;
            left: 52%;
            top: 50%;
            width: 700px;
            height: 700px;
            transform: translate(-50%, -50%);
            z-index: 2;
          }

          .orb-core {
            position: absolute;
            inset: 170px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.88), rgba(118,231,255,0.25) 26%, rgba(86,92,255,0.82) 50%, rgba(9,13,38,0.92) 72%);
            box-shadow: 0 0 100px rgba(118,231,255,0.4), inset 0 0 50px rgba(255,255,255,0.12);
            animation: pulse 6s ease-in-out infinite alternate;
          }

          .ring {
            position: absolute;
            inset: 0;
            border: 1px solid rgba(118, 231, 255, 0.34);
            border-radius: 50%;
            box-shadow: inset 0 0 50px rgba(118,231,255,0.08);
            animation: rotate 16s linear infinite;
          }

          .ring.r2 { inset: 48px; animation-duration: 13s; animation-direction: reverse; }
          .ring.r3 { inset: 96px; animation-duration: 11s; }
          .ring.r4 { inset: 146px; animation-duration: 9s; animation-direction: reverse; }

          .rings-arc {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 670px;
            height: 670px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 1px solid rgba(118,231,255,0.22);
            box-shadow: 0 0 30px rgba(118,231,255,0.17);
          }

          .hud-panel {
            position: absolute;
            border: 1px solid var(--line);
            background: linear-gradient(180deg, rgba(13,18,34,0.7), rgba(8,12,20,0.78));
            box-shadow: 0 0 28px rgba(118, 231, 255, 0.12), inset 0 0 20px rgba(118, 231, 255, 0.04);
            backdrop-filter: blur(4px);
            z-index: 3;
          }

          .hud-panel.left {
            left: 90px;
            top: 190px;
            width: 430px;
            height: 240px;
            border-radius: 28px;
            padding: 26px 24px;
            animation: slideInLeft 1.2s cubic-bezier(.2,.9,.2,1) both;
          }

          .hud-panel.right {
            right: 82px;
            bottom: 122px;
            width: 410px;
            height: 240px;
            border-radius: 28px;
            padding: 22px 24px;
            animation: slideInRight 1.2s cubic-bezier(.2,.9,.2,1) both;
          }

          .panel-kicker {
            color: var(--cyan);
            text-transform: uppercase;
            letter-spacing: 0.18em;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 18px;
          }

          .metric-line {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            margin-top: 18px;
            font-size: 18px;
            color: rgba(237,247,255,0.8);
          }

          .metric-line strong {
            font-size: 38px;
            color: var(--white);
            letter-spacing: -0.04em;
          }

          .bars {
            display: flex;
            align-items: flex-end;
            gap: 12px;
            margin-top: 28px;
            height: 92px;
          }

          .bar {
            flex: 1;
            border-radius: 10px 10px 0 0;
            background: linear-gradient(180deg, rgba(118,231,255,0.9), rgba(159,140,255,0.58));
            box-shadow: 0 0 18px rgba(118,231,255,0.18);
            animation: barRise 4s ease-in-out infinite alternate;
          }

          .bar:nth-child(1) { height: 26%; animation-delay: 0.1s; }
          .bar:nth-child(2) { height: 46%; animation-delay: 0.4s; }
          .bar:nth-child(3) { height: 68%; animation-delay: 0.7s; }
          .bar:nth-child(4) { height: 84%; animation-delay: 1s; }
          .bar:nth-child(5) { height: 100%; animation-delay: 1.3s; }

          .feature-list {
            list-style: none;
            padding: 0;
            margin: 10px 0 0;
            display: grid;
            gap: 14px;
          }

          .feature-list li {
            display: flex;
            align-items: center;
            gap: 12px;
            color: rgba(237,247,255,0.8);
            font-size: 18px;
          }

          .feature-list li::before {
            content: '';
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--cyan), var(--green));
            box-shadow: 0 0 20px rgba(118,231,255,0.7);
          }

          .center-copy {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 4;
            animation: reveal 1.3s ease-out both;
          }

          .eyebrow {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 999px;
            border: 1px solid rgba(118, 231, 255, 0.25);
            background: rgba(9, 13, 22, 0.4);
            color: var(--cyan);
            font-size: 13px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            font-weight: 700;
          }

          h1 {
            margin: 26px auto 18px;
            font-size: clamp(72px, 6vw, 128px);
            line-height: 0.94;
            letter-spacing: -0.06em;
            font-weight: 800;
            color: rgba(237,247,255,0.96);
            text-shadow: 0 0 40px rgba(118,231,255,0.12);
          }

          .subtitle {
            margin: 0;
            font-size: 32px;
            color: rgba(237,247,255,0.74);
            letter-spacing: -0.04em;
            font-weight: 500;
          }

          .cta-bar {
            margin-top: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }

          .pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 16px 26px;
            border-radius: 999px;
            font-size: 18px;
            letter-spacing: 0.04em;
            font-weight: 700;
          }

          .pill.primary {
            background: linear-gradient(135deg, rgba(118,231,255,0.22), rgba(159,140,255,0.2));
            border: 1px solid rgba(118,231,255,0.3);
            color: var(--white);
            box-shadow: 0 0 36px rgba(118,231,255,0.24);
          }

          .pill.secondary {
            background: rgba(7, 13, 22, 0.56);
            border: 1px solid rgba(255,255,255,0.15);
            color: rgba(237,247,255,0.8);
          }

          .tail-light {
            position: absolute;
            left: 50%;
            bottom: 70px;
            transform: translateX(-50%);
            width: 760px;
            height: 100px;
            background: linear-gradient(90deg, transparent, rgba(118,231,255,0.32), rgba(159,140,255,0.32), transparent);
            filter: blur(35px);
            opacity: 0.7;
            animation: shimmer 5s linear infinite;
          }

          .hud-panel, .center-copy { display: none; }

          .chapter {
            position: absolute;
            inset: 0;
            z-index: 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            opacity: 0;
            pointer-events: none;
            will-change: opacity, transform;
          }

          .chapter-kicker {
            color: var(--cyan);
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
          }

          .chapter h1, .chapter h2 {
            margin: 22px 0 14px;
            color: var(--white);
            font-size: 88px;
            line-height: 1.02;
            letter-spacing: -0.045em;
            text-shadow: 0 0 46px rgba(118,231,255,0.28);
          }

          .chapter p {
            max-width: 1080px;
            margin: 0;
            color: rgba(237,247,255,0.76);
            font-size: 32px;
            line-height: 1.45;
          }

          .service-orbit {
            position: relative;
            width: 1060px;
            height: 390px;
            margin-top: 38px;
          }

          .service-orbit::before, .service-orbit::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            border: 1px solid rgba(118,231,255,0.25);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }

          .service-orbit::before { width: 700px; height: 250px; animation: orbitSpin 8s linear infinite; }
          .service-orbit::after { width: 920px; height: 340px; border-color: rgba(159,140,255,0.22); animation: orbitSpin 12s linear infinite reverse; }

          .service-core {
            position: absolute;
            left: 50%;
            top: 50%;
            display: grid;
            width: 156px;
            height: 156px;
            place-items: center;
            border: 1px solid rgba(118,231,255,0.62);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(118,231,255,0.28), rgba(12,19,42,0.92) 70%);
            box-shadow: 0 0 58px rgba(118,231,255,0.3);
            color: var(--white);
            font-size: 22px;
            font-weight: 800;
            transform: translate(-50%, -50%);
            animation: pulse 2.2s ease-in-out infinite alternate;
          }

          .service-node {
            position: absolute;
            display: grid;
            width: 270px;
            min-height: 82px;
            place-items: center;
            padding: 16px 20px;
            border: 1px solid rgba(118,231,255,0.38);
            border-radius: 18px;
            background: rgba(9,16,32,0.9);
            box-shadow: 0 0 36px rgba(118,231,255,0.13);
            color: var(--white);
            font-size: 23px;
            font-weight: 700;
            animation: nodeFloat 2.8s ease-in-out infinite alternate;
          }

          .service-node:nth-child(2) { left: 34px; top: 26px; }
          .service-node:nth-child(3) { right: 34px; top: 26px; animation-delay: .35s; }
          .service-node:nth-child(4) { left: 34px; bottom: 20px; animation-delay: .7s; }
          .service-node:nth-child(5) { right: 34px; bottom: 20px; animation-delay: 1.05s; }

          .journey {
            display: flex;
            align-items: center;
            gap: 30px;
            margin-top: 66px;
          }

          .journey-step {
            display: grid;
            width: 270px;
            height: 180px;
            align-content: center;
            gap: 16px;
            border: 1px solid rgba(118,231,255,0.38);
            background: linear-gradient(160deg, rgba(18,30,52,.9), rgba(8,12,20,.86));
            box-shadow: 0 0 44px rgba(118,231,255,.12);
            color: var(--white);
            font-size: 26px;
            font-weight: 700;
            animation: journeyLift 1.5s ease-in-out infinite alternate;
          }

          .journey-step span { color: var(--cyan); font-size: 15px; letter-spacing: .16em; text-transform: uppercase; }
          .journey-arrow { color: var(--violet); font-size: 48px; animation: arrowPulse 1s ease-in-out infinite alternate; }

          .proof-grid {
            display: flex;
            gap: 24px;
            margin-top: 48px;
          }

          .proof-item {
            min-width: 230px;
            padding: 22px 28px;
            border-top: 1px solid rgba(118,231,255,.55);
            background: rgba(9,16,32,.64);
            color: rgba(237,247,255,.68);
            font-size: 17px;
            animation: proofReveal .65s both;
          }

          .proof-item strong { display: block; margin-bottom: 8px; color: var(--white); font-size: 42px; }
          .proof-item:nth-child(2) { animation-delay: .12s; }
          .proof-item:nth-child(3) { animation-delay: .24s; }
          .proof-item:nth-child(4) { animation-delay: .36s; }

          .chapter-cta {
            margin-top: 38px;
            padding: 18px 34px;
            border: 1px solid rgba(118,231,255,.56);
            background: linear-gradient(110deg, rgba(118,231,255,.2), rgba(159,140,255,.2));
            box-shadow: 0 0 38px rgba(118,231,255,.22);
            color: var(--white);
            font-size: 21px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            animation: ctaGlow 1.4s ease-in-out infinite alternate;
          }

          .group-note { margin-top: 18px !important; font-size: 17px !important; color: rgba(237,247,255,.52) !important; }

          @keyframes orbitSpin { to { transform: translate(-50%, -50%) rotate(360deg); } }
          @keyframes nodeFloat { to { translate: 0 -12px; box-shadow: 0 0 54px rgba(118,231,255,0.28); } }
          @keyframes journeyLift { to { translate: 0 -10px; border-color: rgba(118,231,255,.8); } }
          @keyframes arrowPulse { to { opacity: .45; transform: translateX(10px); } }
          @keyframes proofReveal { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes ctaGlow { to { box-shadow: 0 0 62px rgba(118,231,255,.42); } }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.9; }
            100% { transform: scale(1.08); opacity: 1; }
          }

          @keyframes float {
            0% { transform: translateY(0px) translateX(0px) scale(1); }
            100% { transform: translateY(-28px) translateX(18px) scale(1.08); }
          }

          @keyframes drift {
            0% { transform: perspective(900px) rotateX(63deg) scale(1.7) translateY(0px); }
            100% { transform: perspective(900px) rotateX(63deg) scale(1.9) translateY(14px); }
          }

          @keyframes reveal {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInLeft {
            0% { opacity: 0; transform: translateX(-60px); }
            100% { opacity: 1; transform: translateX(0); }
          }

          @keyframes slideInRight {
            0% { opacity: 0; transform: translateX(60px); }
            100% { opacity: 1; transform: translateX(0); }
          }

          @keyframes barRise {
            0% { transform: scaleY(0.8); opacity: 0.65; }
            100% { transform: scaleY(1); opacity: 1; }
          }

          @keyframes shimmer {
            0% { transform: translateX(-20%) scaleX(0.8); opacity: 0.45; }
            50% { opacity: 1; }
            100% { transform: translateX(20%) scaleX(1.15); opacity: 0.45; }
          }
        </style>
      </head>
      <body>
        <div class="scene">
          <div class="grid"></div>
          <div class="glow one"></div>
          <div class="glow two"></div>

          <div class="logo">
            <div class="logo-mark"></div>
            <div class="logo-text">Scuti AI</div>
          </div>

          <div class="hud-panel left">
            <div class="panel-kicker">Workflow</div>
            <div class="metric-line"><span>Automation</span><strong>92%</strong></div>
            <div class="bars">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </div>
          </div>

          <div class="orb-wrap">
            <div class="ring"></div>
            <div class="ring r2"></div>
            <div class="ring r3"></div>
            <div class="ring r4"></div>
            <div class="orb-core"></div>
            <div class="rings-arc"></div>
          </div>

          <div class="center-copy">
            <div class="eyebrow">AI motion systems</div>
            <h1>Scuti AI</h1>
            <p class="subtitle">Build ideas into action — faster.</p>
            <div class="cta-bar">
              <div class="pill primary">Launch smarter</div>
              <div class="pill secondary">Scale with AI</div>
            </div>
          </div>

          <div class="hud-panel right">
            <div class="panel-kicker">Capabilities</div>
            <ul class="feature-list">
              <li>Generate concepts</li>
              <li>Design workflows</li>
              <li>Automate execution</li>
            </ul>
          </div>

          <div class="tail-light"></div>

          <section class="chapter" data-start="0" data-end="3.2">
            <div class="chapter-kicker">Scuti AI | AI specialist team in Vietnam</div>
            <h1>From Gen AI<br />to real business impact</h1>
            <p>Research, prototypes and production-ready systems, built around your challenges.</p>
          </section>

          <section class="chapter" data-start="3.2" data-end="6.4">
            <div class="chapter-kicker">One team. Practical AI capabilities.</div>
            <h2>Make AI useful at work</h2>
            <div class="service-orbit">
              <div class="service-core">SCUTI AI</div>
              <div class="service-node">Gen AI Consulting</div>
              <div class="service-node">Generative AI OCR</div>
              <div class="service-node">Secure GAI / RAG</div>
              <div class="service-node">Dify Support</div>
            </div>
          </section>

          <section class="chapter" data-start="6.4" data-end="9.6">
            <div class="chapter-kicker">Start small. Prove value. Scale with confidence.</div>
            <h2>From challenge to production</h2>
            <div class="journey">
              <div class="journey-step"><span>01 / Discover</span>Research &amp; strategy</div>
              <div class="journey-arrow">→</div>
              <div class="journey-step"><span>02 / Validate</span>Prototype &amp; PoC</div>
              <div class="journey-arrow">→</div>
              <div class="journey-step"><span>03 / Deliver</span>Build &amp; scale</div>
            </div>
            <p style="margin-top:38px">Secure systems and experienced engineering, tailored to your organization.</p>
          </section>

          <section class="chapter" data-start="9.6" data-end="12.8">
            <div class="chapter-kicker">Engineering experience, built for real industries</div>
            <h2>AI for manufacturing<br />and beyond</h2>
            <p>Combine domain knowledge, Gen AI expertise and high-quality software teams.</p>
            <div class="proof-grid">
              <div class="proof-item"><strong>2015</strong>Founded</div>
              <div class="proof-item"><strong>10+</strong>Years in system development</div>
              <div class="proof-item"><strong>300+</strong>Projects across the group</div>
              <div class="proof-item"><strong>400+</strong>Group members</div>
            </div>
            <p class="group-note">Group-level figures as presented on Scuti's website.</p>
          </section>

          <section class="chapter" data-start="12.8" data-end="16">
            <div class="chapter-kicker">Vietnamese speed. Japanese quality.</div>
            <h2>Build what your business needs next.</h2>
            <p>From AI consulting to full-scale development, Scuti helps turn challenges into outcomes.</p>
            <div class="chapter-cta">Let's work together · scuti.asia</div>
          </section>
        </div>
      </body>
    </html>
  `;
}

async function captureFrames() {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });

  await page.setContent(makeHtml(), { waitUntil: 'load' });
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 250)));

  for (let i = 0; i < totalFrames; i += 1) {
    const time = i / fps;
    await page.evaluate((currentTime) => {
      document.querySelectorAll('.chapter').forEach((chapter) => {
        const start = Number(chapter.dataset.start);
        const end = Number(chapter.dataset.end);
        const fade = 0.38;
        const opacity = Math.max(0, Math.min(1, (currentTime - start) / fade, (end - currentTime) / fade));
        const progress = Math.max(0, Math.min(1, (currentTime - start) / fade));
        chapter.style.opacity = String(opacity);
        chapter.style.transform = `translateY(${(1 - progress) * 34}px) scale(${0.985 + progress * 0.015})`;
      });
    }, time);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const framePath = path.join(framesDir, `${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, fullPage: false });

    if (i < totalFrames - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 / fps - 8));
    }
  }

  await browser.close();
}

async function renderVideo() {
  await captureFrames();

  const inputPattern = path.join(framesDir, '%04d.png');
  execFileSync(ffmpegPath, [
    '-y',
    '-framerate', `${fps}`,
    '-i', inputPattern,
    '-vf', 'scale=1920:1080:flags=lanczos,format=yuv420p',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    outputVideo,
  ], { stdio: 'inherit' });

  console.log(`Video rendered: ${outputVideo}`);
}

renderVideo().catch((error) => {
  console.error(error);
  process.exit(1);
});
