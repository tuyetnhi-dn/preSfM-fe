"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type PointCloudViewerProps = {
  plyUrl: string;
};

function createCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.beginPath();
  context.arc(32, 32, 32, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

export function PointCloudViewer({ plyUrl }: PointCloudViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pointCount, setPointCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setErrorMessage("");
    setPointCount(0);

    const container = containerRef.current;
    container.innerHTML = "";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.01,
      100000,
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const loader = new PLYLoader();

    let pointCloud: THREE.Points | null = null;
    let pointTexture: THREE.Texture | null = null;

    loader.load(
      plyUrl,
      (geometry) => {
        try {
          const positionAttribute = geometry.getAttribute("position");

          if (!positionAttribute) {
            setErrorMessage("File PLY không có dữ liệu position để tạo điểm.");
            setLoading(false);
            return;
          }

          const count = positionAttribute.count;
          setPointCount(count);

          /**
           * Tạo lại geometry dạng point cloud.
           * Mỗi vertex trong file PLY sẽ trở thành một điểm hiển thị.
           */
          const pointGeometry = new THREE.BufferGeometry();

          pointGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
              new Float32Array(positionAttribute.array),
              positionAttribute.itemSize,
            ),
          );

          const colorAttribute = geometry.getAttribute("color");

          if (colorAttribute) {
            pointGeometry.setAttribute(
              "color",
              new THREE.BufferAttribute(
                new Float32Array(colorAttribute.array),
                colorAttribute.itemSize,
              ),
            );
          }

          /**
           * Căn giữa model giống MeshLab.
           */
          pointGeometry.computeBoundingBox();

          const box = pointGeometry.boundingBox;
          if (!box) {
            setErrorMessage("Không thể tính bounding box của file PLY.");
            setLoading(false);
            return;
          }

          const center = new THREE.Vector3();
          const size = new THREE.Vector3();

          box.getCenter(center);
          box.getSize(size);

          pointGeometry.translate(-center.x, -center.y, -center.z);

          /**
           * Scale model về kích thước dễ nhìn.
           */
          const maxDim = Math.max(size.x, size.y, size.z);
          const normalizedSize = 10;
          const scale = maxDim > 0 ? normalizedSize / maxDim : 1;

          pointGeometry.scale(scale, scale, scale);
          pointGeometry.computeBoundingSphere();

          /**
           * Tạo texture tròn cho mỗi điểm để nhìn giống point cloud trong MeshLab hơn.
           */
          pointTexture = createCircleTexture();

          const hasVertexColor = pointGeometry.hasAttribute("color");

          /**
           * Point size tự động theo số lượng điểm.
           * Nhiều điểm thì size nhỏ, ít điểm thì size lớn hơn.
           */
          let pointSize = 0.035;

          if (count > 1_000_000) {
            pointSize = 0.012;
          } else if (count > 500_000) {
            pointSize = 0.016;
          } else if (count > 100_000) {
            pointSize = 0.022;
          } else if (count < 20_000) {
            pointSize = 0.055;
          }

          const material = new THREE.PointsMaterial({
            size: pointSize,
            sizeAttenuation: true,
            vertexColors: hasVertexColor,
            color: hasVertexColor ? 0xffffff : 0xd1d5db,
            map: pointTexture || undefined,
            transparent: true,
            alphaTest: 0.05,
            depthWrite: false,
          });

          pointCloud = new THREE.Points(pointGeometry, material);

          /**
           * Nếu model bị sai hướng so với MeshLab thì mở dòng này.
           */
          // pointCloud.rotation.x = -Math.PI / 2;

          scene.add(pointCloud);

          /**
           * Fit camera theo kích thước model.
           */
          const radius = pointGeometry.boundingSphere?.radius || 5;
          const distance = radius * 2.6;

          camera.position.set(0, 0, distance);
          camera.near = Math.max(distance / 1000, 0.001);
          camera.far = distance * 1000;
          camera.updateProjectionMatrix();

          controls.target.set(0, 0, 0);
          controls.update();

          setLoading(false);

          console.log("PLY URL:", plyUrl);
          console.log("Số điểm:", count);
          console.log("Có màu vertex:", hasVertexColor);
          console.log("Bounding size:", size);
        } catch (error) {
          console.error(error);
          setErrorMessage("Có lỗi khi xử lý dữ liệu PLY.");
          setLoading(false);
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          console.log(`Đang tải PLY: ${percent}%`);
        }
      },
      (error) => {
        console.error("Lỗi load file PLY:", error);
        setErrorMessage("Không thể tải file PLY. Kiểm tra lại đường dẫn file.");
        setLoading(false);
      },
    );

    const handleResize = () => {
      if (!containerRef.current) return;

      const newWidth = containerRef.current.clientWidth || 800;
      const newHeight = containerRef.current.clientHeight || 600;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      if (pointCloud) {
        pointCloud.geometry.dispose();

        if (Array.isArray(pointCloud.material)) {
          pointCloud.material.forEach((material) => material.dispose());
        } else {
          pointCloud.material.dispose();
        }

        scene.remove(pointCloud);
      }

      if (pointTexture) {
        pointTexture.dispose();
      }

      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [plyUrl]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-700">
        <div className="font-medium dark:text-slate-100">PLY Viewer</div>

        <div className="text-steel dark:text-slate-300">
          {loading
            ? "Đang tải..."
            : errorMessage
              ? "Lỗi"
              : `${pointCount.toLocaleString()} điểm`}
        </div>
      </div>

      {errorMessage && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div ref={containerRef} className="h-[70vh] w-full bg-black" />
    </div>
  );
}
