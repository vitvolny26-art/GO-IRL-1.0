import type { Activity, Language } from "../types";
import { buildShareModel } from "./share-model-builder";
import { closingLines, renderShareText } from "./share-renderer";
import type { ShareBuildOptions } from "./types";

export const ShareTemplateService = {
  build(activity: Activity, language: Language, options: ShareBuildOptions = {}) {
    const model = buildShareModel(activity, language, options);
    const variants = closingLines[language];
    const index = options.templateIndex ?? Math.floor(Math.random() * variants.length);
    return renderShareText(model, language, variants[index % variants.length]);
  },
  buildPlainText(activity: Activity, language: Language, url: string, templateIndex?: number) {
    return this.build(activity, language, { templateIndex, url, includePlainTextUrl: true });
  },
};

export const buildActivityShareText = (activity: Activity, language: Language, templateIndex?: number) =>
  ShareTemplateService.build(activity, language, { templateIndex });

