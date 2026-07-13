import type { Language } from "./types";

type AvatarCropState = {
  zoom: number;
  x: number;
  y: number;
};

type AvatarCropRect = {
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const calculateAvatarCrop = (
  imageWidth: number,
  imageHeight: number,
  outputSize: number,
  state: AvatarCropState,
): AvatarCropRect => {
  const safeWidth = Math.max(1, imageWidth);
  const safeHeight = Math.max(1, imageHeight);
  const safeSize = Math.max(1, outputSize);
  const zoom = Math.max(1, state.zoom);
  const scale = Math.max(safeSize / safeWidth, safeSize / safeHeight) * zoom;
  const drawWidth = safeWidth * scale;
  const drawHeight = safeHeight * scale;

  return {
    drawWidth,
    drawHeight,
    offsetX: -(drawWidth - safeSize) * clamp(state.x, 0, 1),
    offsetY: -(drawHeight - safeSize) * clamp(state.y, 0, 1),
  };
};

const copy: Record<Language, {
  title: string;
  hint: string;
  zoom: string;
  horizontal: string;
  vertical: string;
  cancel: string;
  apply: string;
}> = {
  ru: {
    title: "Обрезать фото",
    hint: "Настройте кадр так, чтобы лицо было в круге.",
    zoom: "Приближение",
    horizontal: "Лево / право",
    vertical: "Выше / ниже",
    cancel: "Отмена",
    apply: "Готово",
  },
  uk: {
    title: "Обрізати фото",
    hint: "Налаштуйте кадр так, щоб обличчя було в колі.",
    zoom: "Наближення",
    horizontal: "Ліворуч / праворуч",
    vertical: "Вище / нижче",
    cancel: "Скасувати",
    apply: "Готово",
  },
  cs: {
    title: "Oříznout fotografii",
    hint: "Nastavte výřez tak, aby byl obličej v kruhu.",
    zoom: "Přiblížení",
    horizontal: "Vlevo / vpravo",
    vertical: "Výše / níže",
    cancel: "Zrušit",
    apply: "Hotovo",
  },
  en: {
    title: "Crop photo",
    hint: "Position the image so the face is inside the circle.",
    zoom: "Zoom",
    horizontal: "Left / right",
    vertical: "Up / down",
    cancel: "Cancel",
    apply: "Done",
  },
};

const getLanguage = (): Language => {
  const value = localStorage.getItem("go-irl-language");
  return value === "uk" || value === "cs" || value === "en" ? value : "ru";
};

const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error("Avatar image could not be loaded"));
  };
  image.src = url;
});

const drawCrop = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  state: AvatarCropState,
) => {
  const context = canvas.getContext("2d");
  if (!context) return;
  const size = canvas.width;
  const rect = calculateAvatarCrop(image.naturalWidth, image.naturalHeight, size, state);
  context.clearRect(0, 0, size, size);
  context.drawImage(image, rect.offsetX, rect.offsetY, rect.drawWidth, rect.drawHeight);
};

const canvasToFile = (canvas: HTMLCanvasElement) => new Promise<File>((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error("Avatar crop could not be created"));
      return;
    }
    resolve(new File([blob], `go-irl-avatar-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }, "image/jpeg", 0.9);
});

const openAvatarCropper = async (file: File): Promise<File | null> => {
  const image = await loadImage(file);
  const labels = copy[getLanguage()];
  const state: AvatarCropState = { zoom: 1, x: 0.5, y: 0.35 };

  return new Promise<File | null>((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "avatar-cropper-backdrop";
    backdrop.innerHTML = `
      <section class="avatar-cropper-dialog" role="dialog" aria-modal="true" aria-labelledby="avatar-cropper-title">
        <h2 id="avatar-cropper-title">${labels.title}</h2>
        <p>${labels.hint}</p>
        <div class="avatar-cropper-preview"><canvas width="512" height="512"></canvas></div>
        <label><span>${labels.zoom}</span><input data-crop="zoom" type="range" min="1" max="3" step="0.01" value="1"></label>
        <label><span>${labels.horizontal}</span><input data-crop="x" type="range" min="0" max="1" step="0.01" value="0.5"></label>
        <label><span>${labels.vertical}</span><input data-crop="y" type="range" min="0" max="1" step="0.01" value="0.35"></label>
        <div class="avatar-cropper-actions">
          <button type="button" data-action="cancel">${labels.cancel}</button>
          <button type="button" data-action="apply">${labels.apply}</button>
        </div>
      </section>
    `;

    const canvas = backdrop.querySelector("canvas") as HTMLCanvasElement;
    const inputs = backdrop.querySelectorAll<HTMLInputElement>("input[data-crop]");
    const cancelButton = backdrop.querySelector<HTMLButtonElement>("[data-action='cancel']")!;
    const applyButton = backdrop.querySelector<HTMLButtonElement>("[data-action='apply']")!;
    const previousOverflow = document.body.style.overflow;

    const cleanup = () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      backdrop.remove();
    };

    const finish = (result: File | null) => {
      cleanup();
      resolve(result);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(null);
    };

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.crop as keyof AvatarCropState;
        state[key] = Number(input.value);
        drawCrop(canvas, image, state);
      });
    });

    cancelButton.addEventListener("click", () => finish(null));
    applyButton.addEventListener("click", () => {
      applyButton.disabled = true;
      void canvasToFile(canvas)
        .then((cropped) => finish(cropped))
        .catch(() => {
          applyButton.disabled = false;
        });
    });

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    document.body.append(backdrop);
    drawCrop(canvas, image, state);
    applyButton.focus();
  });
};

export const enableAvatarCropper = () => {
  if (typeof document === "undefined") return () => undefined;

  const processedFiles = new WeakSet<File>();
  const busyInputs = new WeakSet<HTMLInputElement>();

  const handleImageSelection = (event: Event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.type !== "file" || !input.closest("#profile-edit-form")) return;

    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (processedFiles.has(file)) {
      processedFiles.delete(file);
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (busyInputs.has(input)) return;
    busyInputs.add(input);

    void openAvatarCropper(file)
      .then((cropped) => {
        if (!cropped) {
          input.value = "";
          return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(cropped);
        input.files = transfer.files;
        processedFiles.add(cropped);
        input.dispatchEvent(new Event("change", { bubbles: true }));
      })
      .catch(() => {
        input.value = "";
      })
      .finally(() => {
        busyInputs.delete(input);
      });
  };

  document.addEventListener("change", handleImageSelection, true);
  return () => document.removeEventListener("change", handleImageSelection, true);
};
