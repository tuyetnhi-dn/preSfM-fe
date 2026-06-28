"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";

export type PointCloudViewpoint = {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov?: number | null;
};

type PointCloudViewerProps = {
  plyUrl: string;
  title?: string;
  viewpoint?: PointCloudViewpoint | null;
  viewpointKey?: string | number | null;
  className?: string;
  viewerClassName?: string;
};

type CloudTransform = {
  center: THREE.Vector3;
  scale: number;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function toVector3(value: [number, number, number]) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    const item = child as THREE.Points | THREE.Mesh;
    const itemWithGeometry = item as typeof item & {
      geometry?: THREE.BufferGeometry;
    };
    const itemWithMaterial = item as typeof item & {
      material?: THREE.Material | THREE.Material[];
    };

    if (itemWithGeometry.geometry) {
      itemWithGeometry.geometry.dispose();
    }

    const material = itemWithMaterial.material;

    if (material) {
      if (Array.isArray(material)) {
        material.forEach((entry) => entry.dispose());
      } else {
        material.dispose();
      }
    }
  });
}

export function PointCloudViewer({
  plyUrl,
  title = "Point Cloud",
  viewpoint,
  viewpointKey,
  className,
  viewerClassName,
}: PointCloudViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const cloudTransformRef = useRef<CloudTransform | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const latestViewpointRef = useRef<PointCloudViewpoint | null | undefined>(
    viewpoint,
  );

  const [pointCount, setPointCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  latestViewpointRef.current = viewpoint;

  function renderOnce() {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;

    if (!scene || !camera || !renderer) return;

    renderer.render(scene, camera);
  }

  function applyDefaultCamera() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) return;

    camera.position.set(2.6, 2.0, 2.6);
    camera.up.set(0, 1, 0);
    camera.fov = 45;
    camera.near = 0.001;
    camera.far = 10000;
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.update();

    renderOnce();
  }

  function applyViewpoint(nextViewpoint?: PointCloudViewpoint | null) {
    if (!nextViewpoint) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const transform = cloudTransformRef.current;

    if (!camera || !controls || !transform) return;

    const position = toVector3(nextViewpoint.position)
      .sub(transform.center)
      .multiplyScalar(transform.scale);

    const target = toVector3(nextViewpoint.target)
      .sub(transform.center)
      .multiplyScalar(transform.scale);

    const up = toVector3(nextViewpoint.up).normalize();

    if (!Number.isFinite(position.x + position.y + position.z)) return;
    if (!Number.isFinite(target.x + target.y + target.z)) return;

    const distance = position.distanceTo(target);

    if (distance < 1e-8) {
      return;
    }

    camera.position.copy(position);
    camera.up.copy(up.lengthSq() > 0 ? up : new THREE.Vector3(0, 1, 0));

    if (
      nextViewpoint.fov !== null &&
      nextViewpoint.fov !== undefined &&
      Number.isFinite(nextViewpoint.fov)
    ) {
      camera.fov = Number(nextViewpoint.fov);
    }

    camera.near = 0.001;
    camera.far = 10000;
    camera.updateProjectionMatrix();

    controls.target.copy(target);
    controls.update();

    renderOnce();
  }

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let disposed = false;

    setIsLoading(true);
    setLoadError(null);
    setPointCount(null);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.001,
      10000,
    );
    camera.position.set(2.6, 2.0, 2.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.target.set(0, 0, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    pointsRef.current = null;
    cloudTransformRef.current = null;

    const animate = () => {
      if (disposed) return;

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;

      const nextWidth = Math.max(container.clientWidth, 1);
      const nextHeight = Math.max(container.clientHeight, 1);

      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(nextWidth, nextHeight);
      renderer.render(scene, camera);
    });

    resizeObserver.observe(container);

    const loader = new PLYLoader();
    loader.setCrossOrigin("anonymous");

    loader.load(
      plyUrl,
      (geometry) => {
        if (disposed) {
          geometry.dispose();
          return;
        }

        geometry.computeBoundingBox();

        const boundingBox = geometry.boundingBox;

        if (!boundingBox) {
          setLoadError("PLY không có bounding box hợp lệ.");
          setIsLoading(false);
          geometry.dispose();
          return;
        }

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        boundingBox.getCenter(center);
        boundingBox.getSize(size);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = maxDimension > 0 ? 2.8 / maxDimension : 1;

        geometry.translate(-center.x, -center.y, -center.z);
        geometry.scale(scale, scale, scale);
        geometry.computeBoundingSphere();

        const colorAttribute = geometry.getAttribute("color");
        const hasColor = Boolean(colorAttribute);

        const material = new THREE.PointsMaterial({
          size: 0.01,
          sizeAttenuation: true,
          vertexColors: hasColor,
          ...(hasColor ? {} : { color: 0xe2e8f0 }),
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        pointsRef.current = points;
        cloudTransformRef.current = {
          center,
          scale,
        };

        const positionAttribute = geometry.getAttribute("position");
        setPointCount(positionAttribute?.count ?? null);
        setIsLoading(false);

        const nextViewpoint = latestViewpointRef.current;

        if (nextViewpoint) {
          applyViewpoint(nextViewpoint);
        } else {
          applyDefaultCamera();
        }
      },
      undefined,
      (event) => {
        if (disposed) return;

        console.error("[PointCloudViewer] Failed to load PLY", event);
        setLoadError("Không thể tải file PLY.");
        setIsLoading(false);
      },
    );

    return () => {
      disposed = true;

      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      controls.dispose();

      if (pointsRef.current) {
        scene.remove(pointsRef.current);
        disposeObject3D(pointsRef.current);
      }

      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      pointsRef.current = null;
      cloudTransformRef.current = null;
    };
  }, [plyUrl]);

  useEffect(() => {
    latestViewpointRef.current = viewpoint;

    if (!viewpoint) return;

    applyViewpoint(viewpoint);
    // Chỉ chạy lại khi viewpointKey đổi để tránh reset camera khi user orbit bằng chuột.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewpointKey]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </p>

        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {pointCount !== null
            ? `${new Intl.NumberFormat("vi-VN").format(pointCount)} điểm`
            : "--"}
        </p>
      </div>

      <div
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700",
          viewerClassName,
        )}
      >
        <div ref={containerRef} className="h-full min-h-0 w-full" />

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-xs font-medium text-slate-200">
            Đang tải PLY...
          </div>
        ) : null}

        {loadError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-4 text-center text-xs font-medium text-red-300">
            {loadError}
          </div>
        ) : null}

        {!isLoading && !loadError && !viewpoint ? (
          <div className="absolute left-3 top-3 rounded-lg bg-amber-500/15 px-3 py-2 text-[11px] font-medium text-amber-200">
            Chưa có camera pose cho frame này.
          </div>
        ) : null}
      </div>
    </div>
  );
}
