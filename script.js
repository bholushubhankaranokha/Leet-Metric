document.addEventListener("DOMContentLoaded", function() {
    // Binary Rain Background
    initBinaryBackground();
    
    // Initialize Floating Particles
    initFloatingParticles();

    // Initialize Hacking Sound
    const hackingSound = document.getElementById('hacking-sound');
    
    // Try to play sound (will be triggered by user interaction)
    function playHackingSound() {
        if (hackingSound) {
            hackingSound.volume = 0.2;
            hackingSound.play().catch(e => console.log("Sound play failed:", e));
        }
    }

    function stopHackingSound() {
        if (hackingSound) {
            hackingSound.pause();
            hackingSound.currentTime = 0;
        }
    }

    // DOM Elements
    const elements = {
        searchBtn: document.getElementById("search-btn"),
        userInput: document.getElementById("user-input"),
        dashboard: document.getElementById("dashboard"),
        loading: document.getElementById("loading"),
        emptyState: document.getElementById("empty-state"),
        
        // Profile elements
        displayName: document.getElementById("display-name"),
        rankValue: document.getElementById("rank-value"),
        rankValueStat: document.getElementById("rank-value-stat"),
        totalSolved: document.getElementById("total-solved"),
        totalQuestions: document.getElementById("total-questions"),
        totalSubmissions: document.getElementById("total-submissions"),
        contribution: document.getElementById("contribution"),
        reputation: document.getElementById("reputation"),
        acceptanceRate: document.getElementById("acceptance-rate"),
        
        // Difficulty bubbles
        easyValue: document.getElementById("easy-value"),
        mediumValue: document.getElementById("medium-value"),
        hardValue: document.getElementById("hard-value"),
        
        // Sphere
        sphereContainer: document.getElementById("sphere-container"),
        sphereStats: document.getElementById("sphere-stats"),
        
        // Submissions
        submissionsList: document.getElementById("submissions-list"),
        
        // Loading
        loadingMessage: document.getElementById("loading-message"),
        loadingProgress: document.getElementById("loading-progress"),
        progressHex: document.getElementById("progress-hex"),
        progressPercent: document.getElementById("progress-percent"),
        typingEffect: document.getElementById("typing-effect")
    };

    const API_BASE = "https://leetcode-stats-api.vercel.app";

    // Binary Rain Background
    function initBinaryBackground() {
        const canvas = document.getElementById('binary-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const binary = "01";
        const fontSize = 14;
        const columns = canvas.width / fontSize;

        const drops = [];
        for(let x = 0; x < columns; x++) {
            drops[x] = Math.floor(Math.random() * canvas.height);
        }

        function drawBinary() {
            ctx.fillStyle = 'rgba(10, 10, 20, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for(let i = 0; i < drops.length; i++) {
                const text = binary[Math.floor(Math.random() * binary.length)];
                
                // Random colors for binary
                if(Math.random() > 0.98) {
                    ctx.fillStyle = '#ff00ff';
                } else if(Math.random() > 0.96) {
                    ctx.fillStyle = '#ffff00';
                } else {
                    ctx.fillStyle = '#00ffff';
                }
                
                ctx.font = fontSize + 'px monospace';
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(drawBinary, 50);

        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // Floating Particles
    function initFloatingParticles() {
        if (typeof particlesJS === 'undefined') return;
        
        particlesJS('floating-particles', {
            particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: ['#00ffff', '#ff00ff', '#ffff00'] },
                shape: { type: 'circle' },
                opacity: { value: 0.3, random: true },
                size: { value: 2, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00ffff',
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' }
                }
            }
        });
    }

    // Create Enhanced Submission Sphere
    function createSubmissionSphere(data) {
        if (!data || !data.submissionCalendar || !elements.sphereContainer) return;

        const container = elements.sphereContainer;
        container.innerHTML = '';

        // Parse calendar data
        const calendar = data.submissionCalendar;
        const submissions = [];
        
        Object.entries(calendar).forEach(([timestamp, count]) => {
            submissions.push({
                timestamp: parseInt(timestamp) * 1000,
                count: count,
                date: new Date(parseInt(timestamp) * 1000)
            });
        });

        // Sort by date
        submissions.sort((a, b) => a.timestamp - b.timestamp);

        // Get last 90 days for visualization
        const recentSubmissions = submissions.slice(-90);
        
        // Setup Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / 400, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, 400);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create sphere geometry
        const sphereRadius = 3;
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
        
        // Create particles for submissions
        const particleCount = Math.min(recentSubmissions.length * 3, 500);
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        // Calculate max count for color scaling
        const maxCount = Math.max(...recentSubmissions.map(s => s.count), 1);

        for (let i = 0; i < particleCount; i++) {
            // Random position on sphere surface with some offset based on submission count
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            // Get submission count for this particle (randomly assigned from data)
            const subData = recentSubmissions[Math.floor(Math.random() * recentSubmissions.length)];
            const count = subData.count;
            
            // Calculate radius based on submission count (higher = further out)
            const radiusOffset = (count / maxCount) * 1.5;
            const r = sphereRadius + radiusOffset;
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Color based on submission count
            let color;
            if (count <= 10) color = new THREE.Color(0x00ffff); // Cyan
            else if (count <= 25) color = new THREE.Color(0xff00ff); // Magenta
            else if (count <= 50) color = new THREE.Color(0xffff00); // Yellow
            else color = new THREE.Color(0xff0000); // Red

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create particle material
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);

        // Create wireframe sphere
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const wireframeSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);

        // Create inner glow sphere
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.05
        });
        const glowSphere = new THREE.Mesh(sphereGeometry, glowMaterial);

        scene.add(glowSphere);
        scene.add(wireframeSphere);
        scene.add(particles);

        camera.position.z = 10;

        // Add floating rings
        const ringGeometry = new THREE.TorusGeometry(4, 0.05, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff00ff,
            transparent: true,
            opacity: 0.2
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
        ring2.rotation.z = Math.PI / 3;
        ring2.material.color.setHex(0xffff00);
        ring2.material.opacity = 0.15;
        scene.add(ring2);

        // Animation
        function animate() {
            requestAnimationFrame(animate);

            // Rotate everything
            particles.rotation.y += 0.001;
            wireframeSphere.rotation.y += 0.0005;
            glowSphere.rotation.y += 0.0005;
            ring.rotation.x += 0.001;
            ring.rotation.z += 0.001;
            ring2.rotation.y += 0.001;
            ring2.rotation.x += 0.001;

            renderer.render(scene, camera);
        }

        animate();

        // Add click interaction
        renderer.domElement.addEventListener('click', (event) => {
            // Show stats panel with submission info
            const totalSubs = data.totalSubmissions?.[0]?.submissions || 0;
            const recentCount = recentSubmissions.length;
            
            if (elements.sphereStats) {
                elements.sphereStats.innerHTML = `
                    <h4>SUBMISSION QUANTUM</h4>
                    <p>Total: ${totalSubs.toLocaleString()}</p>
                    <p>Last 90 days: ${recentCount}</p>
                    <p>Peak: ${maxCount} in one day</p>
                `;
                elements.sphereStats.classList.add('active');
                
                setTimeout(() => {
                    elements.sphereStats.classList.remove('active');
                }, 3000);
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            renderer.setSize(container.clientWidth, 400);
            camera.aspect = container.clientWidth / 400;
            camera.updateProjectionMatrix();
        });
    }

    // Loading messages
    const loadingMessages = [
        "INITIALIZING SEQUENCE",
        "BYPASSING FIREWALL",
        "DECRYPTING DATA",
        "ACCESSING MAINFRAME",
        "LOADING PROFILE",
        "RENDERING MATRIX",
        "CALCULATING STATS",
        "HACKING LEETCODE",
        "EVADING DETECTION",
        "EXTRACTING DATA"
    ];
    let msgIndex = 0;
    let typingIndex = 0;
    const typingMessages = [
        "ACCESSING MAINFRAME",
        "BYPASSING SECURITY",
        "DECRYPTING PACKETS",
        "ESTABLISHING LINK",
        "QUANTUM COMPUTING",
        "NEURAL NETWORK ACTIVE"
    ];

    // Validate username
    function validateUsername(username) {
        if (!username || username.trim() === "") {
            showNotification("ERROR: Username required", "error");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,25}$/;
        if (!regex.test(username)) {
            showNotification("ERROR: Invalid username format", "error");
            return false;
        }
        return true;
    }

    // Show notification
    function showNotification(message, type) {
        const toast = document.createElement("div");
        toast.className = `quantum-toast ${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Format date
    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Update loading UI
    function updateLoadingUI(progress) {
        // Update progress bar
        if (elements.loadingProgress) {
            elements.loadingProgress.style.width = progress + '%';
        }
        
        // Update hex value
        if (elements.progressHex) {
            const hexValue = Math.floor(progress * 2.55).toString(16).toUpperCase().padStart(2, '0');
            elements.progressHex.textContent = `0x${hexValue}`;
        }
        
        // Update percentage
        if (elements.progressPercent) {
            elements.progressPercent.textContent = Math.floor(progress) + '%';
        }
        
        // Update loading message
        if (elements.loadingMessage && progress % 10 < 2) {
            elements.loadingMessage.textContent = `>_ ${loadingMessages[msgIndex % loadingMessages.length]}`;
            msgIndex++;
        }
        
        // Update typing effect
        if (elements.typingEffect && progress % 15 < 1) {
            elements.typingEffect.textContent = typingMessages[typingIndex % typingMessages.length];
            typingIndex++;
        }
    }

    // Fetch user data
    async function fetchUserDetails(username) {
        try {
            // Show loading
            elements.loading.style.display = "flex";
            elements.dashboard.style.display = "none";
            elements.emptyState.style.display = "none";
            elements.searchBtn.disabled = true;

            // Play hacking sound
            playHackingSound();

            // Animate loading
            const interval = setInterval(() => {
                updateLoadingUI(progress);
            }, 100);

            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 95;
                updateLoadingUI(progress);
            }, 400);

            const url = `${API_BASE}/${encodeURIComponent(username)}`;
            const response = await fetch(url);

            clearInterval(interval);
            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error("USER_NOT_FOUND");
            }

            const data = await response.json();
            
            if (data.status === "error") {
                throw new Error(data.message || "USER_NOT_FOUND");
            }

            // Complete loading
            progress = 100;
            updateLoadingUI(progress);
            await new Promise(resolve => setTimeout(resolve, 800));

            displayUserData(data, username);

        } catch (error) {
            showNotification(`ERROR: ${error.message}`, "error");
            elements.emptyState.style.display = "block";
        } finally {
            elements.loading.style.display = "none";
            elements.searchBtn.disabled = false;
            stopHackingSound();
        }
    }

    // Display user data
    function displayUserData(data, username) {
        elements.dashboard.style.display = "block";
        elements.emptyState.style.display = "none";

        // Update profile
        if (elements.displayName) elements.displayName.textContent = username;
        if (elements.rankValue) elements.rankValue.textContent = `#${data.ranking?.toLocaleString() || 'N/A'}`;
        if (elements.rankValueStat) elements.rankValueStat.textContent = `#${data.ranking?.toLocaleString() || 'N/A'}`;
        if (elements.totalSolved) elements.totalSolved.textContent = data.totalSolved || 0;
        if (elements.totalQuestions) elements.totalQuestions.textContent = data.totalQuestions || 0;
        if (elements.contribution) elements.contribution.textContent = data.contributionPoint || 0;
        if (elements.reputation) elements.reputation.textContent = data.reputation || 0;

        // Calculate acceptance rate
        const totalSubs = data.totalSubmissions?.[0]?.submissions || 0;
        const acceptedSubs = data.totalSubmissions?.[0]?.count || 0;
        const acceptanceRate = totalSubs > 0 ? ((acceptedSubs / totalSubs) * 100).toFixed(1) : 0;
        if (elements.acceptanceRate) elements.acceptanceRate.textContent = acceptanceRate;
        if (elements.totalSubmissions) elements.totalSubmissions.textContent = totalSubs.toLocaleString();

        // Update difficulty bubbles
        if (elements.easyValue) elements.easyValue.textContent = `${data.easySolved || 0}/${data.totalEasy || 0}`;
        if (elements.mediumValue) elements.mediumValue.textContent = `${data.mediumSolved || 0}/${data.totalMedium || 0}`;
        if (elements.hardValue) elements.hardValue.textContent = `${data.hardSolved || 0}/${data.totalHard || 0}`;

        // Create enhanced submission sphere
        createSubmissionSphere(data);

        // Display recent submissions (last 5)
        if (data.recentSubmissions && data.recentSubmissions.length > 0 && elements.submissionsList) {
            elements.submissionsList.innerHTML = data.recentSubmissions.slice(0, 5).map(sub => {
                const status = sub.statusDisplay.toLowerCase();
                const statusClass = status.includes('accept') ? 'accepted' : 'wrong';
                
                return `
                    <div class="submission-item">
                        <div class="submission-status ${statusClass}">
                            <i class="fa-solid ${statusClass === 'accepted' ? 'fa-check' : 'fa-times'}"></i>
                        </div>
                        <div>
                            <div class="submission-title">${sub.title}</div>
                            <div class="submission-meta">
                                <span><i class="fa-regular fa-clock"></i> ${formatDate(sub.timestamp)}</span>
                                <span><i class="fa-regular fa-code"></i> ${sub.lang || 'N/A'}</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color: var(--quantum-cyan);"></i>
                    </div>
                `;
            }).join('');
        } else if (elements.submissionsList) {
            elements.submissionsList.innerHTML = '<div class="submission-item">NO RECENT SUBMISSIONS FOUND</div>';
        }
    }

    // Event listeners
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            const username = elements.userInput.value.trim();
            if (validateUsername(username)) {
                fetchUserDetails(username);
            }
        });
    }

    if (elements.userInput) {
        elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.searchBtn.click();
            }
        });
    }

    // Suggestion chip
    const suggestionChip = document.querySelector('.suggestion-quantum');
    if (suggestionChip) {
        suggestionChip.addEventListener('click', () => {
            if (elements.userInput) {
                elements.userInput.value = 'BholuShubhankarAnokha';
                elements.searchBtn.click();
            }
        });
    }

    // Preload sound on first interaction
    document.body.addEventListener('click', function initSound() {
        if (hackingSound) {
            hackingSound.load();
            document.body.removeEventListener('click', initSound);
        }
    }, { once: true });

    // Handle window resize for responsive canvas
    window.addEventListener('resize', () => {
        if (elements.sphereContainer) {
            // Three.js will handle resize in the sphere function
        }
    });
});