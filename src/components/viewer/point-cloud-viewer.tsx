'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface PointCloudViewerProps {
  plyUrl: string;
}

export function PointCloudViewer({ plyUrl }: PointCloudViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f4f6);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.01, 5000);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.7;

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(2, 4, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const loader = new PLYLoader();
    loader.load(
      plyUrl,
      (geometry) => {
        geometry.computeVertexNormals();
        const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
      },
      undefined,
      () => {
        const fallback = new THREE.Mesh(
          new THREE.TorusKnotGeometry(0.7, 0.2, 220, 16),
          new THREE.MeshStandardMaterial({ color: '#0f766e', metalness: 0.2, roughness: 0.4 }),
        );
        scene.add(fallback);
      },
    );

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onResize);

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [plyUrl]);

  return <div ref={containerRef} className="h-[65vh] w-full rounded-2xl border border-slate-200 bg-white shadow-soft" />;
}
