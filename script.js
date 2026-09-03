/* Scroll reveal */
const revealEls = document.querySelectorAll(".reveal, .j-item");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealEls.forEach((el) => revealObs.observe(el));

/* Nav border on scroll */
window.addEventListener("scroll", () => {
  document
    .getElementById("nav")
    .classList.toggle("on-scroll", window.scrollY > 30);
});

/* Kinetic letter-by-letter name */
(function () {
  const kn = document.getElementById("kineticName");
  if (!kn) return;
  const text = kn.textContent;
  kn.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.style.animationDelay = 0.15 + i * 0.045 + "s";
    s.textContent = ch === " " ? "\u00A0" : ch;
    kn.appendChild(s);
  });
})();

/* Floating photo parallax */
(function () {
  const photo = document.getElementById("heroPhotoFloat");
  const hero = document.getElementById("heroSection");
  if (!photo || !hero) return;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    photo.style.transform = `translate(${mx * -10}px, ${my * -14}px)`;
  });
})();

/* Init JS with your Public Key */
emailjs.init("e0JjiWeUGQ_WnpIUa");

/* Contact form -> sends directly to your inbox via EmailJS */
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("cf-name").value;
  const email = document.getElementById("cf-email").value;
  const msg = document.getElementById("cf-msg").value;
  const statusEl = document.getElementById("formStatus");

  statusEl.textContent = "Sending…";

  emailjs
    .send("service_6hc5ju3", "template_brs3cvm", {
      name: name,
      email: email,
      message: msg,
    })
    .then(
      function () {
        statusEl.textContent = "Message sent — thank you!";
        document.getElementById("contactForm").reset();
      },
      function (error) {
        statusEl.textContent =
          "Something went wrong. Please try emailing directly.";
        console.error("EmailJS error:", error);
      },
    );
});

/* ---------- HERO: 3D NETWORK SPHERE ---------- */
(function () {
  const canvas = document.getElementById("net-canvas");
  const heroSection = document.getElementById("heroSection");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0x3a2a1a, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(6, 8, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xffa63d, 2.4, 30);
  rim.position.set(-5, 3, 4);
  scene.add(rim);
  const fillLight = new THREE.PointLight(0xff5f45, 0.9, 30);
  fillLight.position.set(4, -3, -3);
  scene.add(fillLight);

  // Icosahedron wireframe "data sphere"
  const mainGroup = new THREE.Group();
  const icoGeo = new THREE.IcosahedronGeometry(2.6, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0xffa63d,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    emissive: 0xff7a45,
    emissiveIntensity: 0.25,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  mainGroup.add(ico);

  // Node points at vertices with glow spheres
  const posAttr = icoGeo.attributes.position;
  const nodeCount = posAttr.count;
  const nodes = [];
  for (let i = 0; i < nodeCount; i += 3) {
    const v = new THREE.Vector3(
      posAttr.getX(i),
      posAttr.getY(i),
      posAttr.getZ(i),
    );
    const sMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffa63d,
      emissiveIntensity: 1,
      metalness: 0.3,
      roughness: 0.2,
    });
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), sMat);
    s.position.copy(v);
    mainGroup.add(s);
    nodes.push(s);
  }

  // Orbiting particles around the sphere
  const orbitGroup = new THREE.Group();
  const orbitCount = 40;
  const orbitGeo = new THREE.SphereGeometry(0.03, 6, 6);
  for (let i = 0; i < orbitCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.4 + Math.random() * 1.6;
    const y = (Math.random() - 0.5) * 3.5;
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xffa63d : 0xff7a45,
      transparent: true,
      opacity: 0.7,
    });
    const p = new THREE.Mesh(orbitGeo, mat);
    p.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    p.userData.angle = angle;
    p.userData.radius = radius;
    p.userData.speed = 0.1 + Math.random() * 0.2;
    p.userData.y = y;
    orbitGroup.add(p);
  }
  mainGroup.add(orbitGroup);
  scene.add(mainGroup);

  function resize() {
    const w = heroSection.clientWidth,
      h = heroSection.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let mouseX = 0,
    mouseY = 0,
    targetRotX = 0,
    targetRotY = 0;
  heroSection.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  let scrollProgress = 0;
  function updateScroll() {
    const rect = heroSection.getBoundingClientRect();
    const p =
      1 -
      Math.min(
        Math.max(rect.bottom / (rect.height + window.innerHeight), 0),
        1,
      );
    scrollProgress = Math.min(Math.max(p, 0), 1);
  }
  window.addEventListener("scroll", updateScroll);
  updateScroll();

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mainGroup.rotation.y = t * 0.12;
    mainGroup.rotation.x = Math.sin(t * 0.2) * 0.08;

    targetRotX += (-mouseY * 0.25 - targetRotX) * 0.05;
    targetRotY += (mouseX * 0.4 - targetRotY) * 0.05;
    mainGroup.rotation.x += targetRotX * 0.3;
    mainGroup.rotation.y += targetRotY * 0.3;

    orbitGroup.children.forEach((p) => {
      const a = p.userData.angle + t * p.userData.speed;
      p.position.set(
        Math.cos(a) * p.userData.radius,
        p.userData.y + Math.sin(t + p.userData.angle) * 0.2,
        Math.sin(a) * p.userData.radius,
      );
    });

    // scroll dolly zoom
    camera.position.z = 9 - scrollProgress * 3.2;
    camera.position.y = scrollProgress * 1.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();
})();

function initPdfSlideshow(containerId, pdfUrl, interval = 6000) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const canvas = container.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const dotsContainer = container.querySelector(".ss-dots");

  let pdfDoc = null;
  let pageNum = 1;
  let rendering = false;

  // Load PDF automatically
  pdfjsLib
    .getDocument(pdfUrl)
    .promise.then(function (pdf) {
      pdfDoc = pdf;

      // Create dots
      dotsContainer.innerHTML = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const dot = document.createElement("span");

        dot.className = "dot" + (i === 1 ? " active" : "");

        dotsContainer.appendChild(dot);
      }

      // Render first page
      renderPage(1);

      // Auto change pages
      setInterval(function () {
        pageNum = (pageNum % pdfDoc.numPages) + 1;

        renderPage(pageNum);
      }, interval);
    })
    .catch(function (error) {
      console.error("Error loading PDF:", pdfUrl, error);
    });

  function renderPage(num) {
    if (rendering || !pdfDoc) return;

    rendering = true;

    pdfDoc
      .getPage(num)
      .then(function (page) {
        const viewport = page.getViewport({
          scale: 1.5,
        });

        canvas.width = viewport.width;

        canvas.height = viewport.height;

        canvas.classList.remove("loaded");

        return page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;
      })
      .then(function () {
        canvas.classList.add("loaded");

        rendering = false;

        // Update dots
        const dots = dotsContainer.querySelectorAll(".dot");

        dots.forEach(function (dot, index) {
          dot.classList.toggle("active", index === num - 1);
        });
      })
      .catch(function (error) {
        rendering = false;

        console.error(error);
      });
  }
}

// PROJECT 1
initPdfSlideshow(
  "pdfProject1",
  "source/Customer-Shopping-Behavior-Analysis.pdf",
  6000,
);

// PROJECT 2
initPdfSlideshow(
  "pdfProject2",
  "source/EV-Charging-Station-Performance-Analysis.pdf",
  6000,
);

// PROJECT 3
initPdfSlideshow(
  "pdfProject3",
  "source/Insurance.pdf",
  6000,
);
function initDashboard3D(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let rotateX = -8;
  let rotateY = -20;

  function updateRotation() {
    container.style.setProperty("--rotateX", `${rotateX}deg`);
    container.style.setProperty("--rotateY", `${rotateY}deg`);
  }

  // Automatic slow rotation
  function autoRotate() {
    if (!isDragging) {
      rotateY += 0.03; // smaller = slower
      updateRotation();
    }

    requestAnimationFrame(autoRotate);
  }

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    container.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    rotateY += deltaX * 0.4;
    rotateX -= deltaY * 0.25;

    rotateX = Math.max(-35, Math.min(35, rotateX));

    updateRotation();

    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    container.classList.remove("dragging");
  });

  updateRotation();
  autoRotate();
}

initDashboard3D("p1-3d");
initDashboard3D("p2-3d");
initDashboard3D("p3-3d");
