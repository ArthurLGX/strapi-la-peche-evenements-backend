import type { Core } from "@strapi/strapi";
import {
  isPlainStringBlocksContent,
  plainStringToStrapiBlocks,
} from "./utils/migrate-process-step-blocks";

const LANDING_SECTION_UID = "api::landing-section.landing-section" as const;

export default {
  register() {},

  /**
   * Migre les `processSteps[].content` encore stockés comme chaînes vers le format Blocks.
   * Sans cela, l’éditeur Slate de l’admin plante à l’ouverture de l’entrée.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    for (const status of ["draft", "published"] as const) {
      let docs: Record<string, unknown>[];
      try {
        docs = (await strapi.documents(LANDING_SECTION_UID).findMany({
          status,
          populate: ["processSteps"],
        })) as Record<string, unknown>[];
      } catch (e) {
        strapi.log.warn(
          `[processSteps blocks migration] findMany (${status}) : ${e}`,
        );
        continue;
      }

      for (const doc of docs) {
        const documentId = doc.documentId;
        const steps = doc.processSteps;
        if (!Array.isArray(steps) || steps.length === 0 || !documentId) continue;

        let changed = false;
        const newSteps = steps.map((step: Record<string, unknown>) => {
          if (!isPlainStringBlocksContent(step.content)) return step;
          changed = true;
          return {
            ...step,
            content: plainStringToStrapiBlocks(step.content),
          };
        });

        if (!changed) continue;

        try {
          await strapi.documents(LANDING_SECTION_UID).update({
            documentId: String(documentId),
            status,
            // Cast : migration runtime — les types générés n’exposent pas toujours les composants imbriqués.
            data: { processSteps: newSteps } as never,
          });
          strapi.log.info(
            `[processSteps blocks migration] OK documentId=${documentId} (${status})`,
          );
        } catch (e) {
          strapi.log.error(
            `[processSteps blocks migration] Échec documentId=${documentId} (${status})`,
            e,
          );
        }
      }
    }
  },
};
