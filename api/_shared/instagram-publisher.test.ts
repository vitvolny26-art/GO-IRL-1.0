import { afterEach, describe, expect, it, vi } from "vitest";
import { publishInstagramFeedImage } from "./instagram-publisher.js";

const runtimeEnv = (globalThis as typeof globalThis & {
  process: { env: Record<string, string | undefined> };
}).process.env;

const configurePublisher = () => {
  runtimeEnv.META_GRAPH_VERSION = "v23.0";
  runtimeEnv.INSTAGRAM_PUBLISH_ACCOUNT_ID = "17841480191590968";
  runtimeEnv.INSTAGRAM_PUBLISH_ACCESS_TOKEN = "publish-secret-token";
};

const jsonResponse = (payload: unknown, status = 200) => new Response(
  JSON.stringify(payload),
  {
    status,
    headers: { "content-type": "application/json" },
  },
);

describe("Instagram feed publisher", () => {
  afterEach(() => {
    delete runtimeEnv.META_GRAPH_VERSION;
    delete runtimeEnv.INSTAGRAM_PUBLISH_ACCOUNT_ID;
    delete runtimeEnv.INSTAGRAM_PUBLISH_ACCESS_TOKEN;
    vi.unstubAllGlobals();
  });

  it("creates an image container and publishes that exact container", async () => {
    configurePublisher();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "container-123" }))
      .mockResolvedValueOnce(jsonResponse({ id: "media-456" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishInstagramFeedImage({
      imageUrl: "https://go-irl.fun/social/feed-square.jpg",
      caption: "Less scrolling. More life.",
    })).resolves.toEqual({
      containerId: "container-123",
      mediaId: "media-456",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://graph.instagram.com/v23.0/17841480191590968/media",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://graph.instagram.com/v23.0/17841480191590968/media_publish",
    );

    const createInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const publishInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(createInit.headers).toMatchObject({
      authorization: "Bearer publish-secret-token",
      "content-type": "application/x-www-form-urlencoded",
    });
    expect(publishInit.headers).toMatchObject({
      authorization: "Bearer publish-secret-token",
      "content-type": "application/x-www-form-urlencoded",
    });

    const createBody = new URLSearchParams(String(createInit.body));
    expect(createBody.get("image_url")).toBe("https://go-irl.fun/social/feed-square.jpg");
    expect(createBody.get("caption")).toBe("Less scrolling. More life.");
    expect(new URLSearchParams(String(publishInit.body)).get("creation_id")).toBe("container-123");

    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("publish-secret-token");
    expect(String(createInit.body)).not.toContain("publish-secret-token");
    expect(String(fetchMock.mock.calls[1]?.[0])).not.toContain("publish-secret-token");
    expect(String(publishInit.body)).not.toContain("publish-secret-token");
  });

  it.each([
    "META_GRAPH_VERSION",
    "INSTAGRAM_PUBLISH_ACCOUNT_ID",
    "INSTAGRAM_PUBLISH_ACCESS_TOKEN",
  ])("fails closed when %s is missing", async (missingName: string) => {
    configurePublisher();
    delete runtimeEnv[missingName];
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishInstagramFeedImage({
      imageUrl: "https://go-irl.fun/social/feed-square.jpg",
    })).rejects.toThrow(`missing_environment:${missingName}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects non-HTTPS image URLs before calling Meta", async () => {
    configurePublisher();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishInstagramFeedImage({
      imageUrl: "http://example.test/feed-square.jpg",
    })).rejects.toThrow("instagram_publish_image_url_invalid");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not publish when container creation fails and sanitizes provider errors", async () => {
    configurePublisher();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      error: {
        message: "sensitive provider message",
        code: 10,
      },
    }, 403));
    vi.stubGlobal("fetch", fetchMock);

    let thrown: unknown;
    try {
      await publishInstagramFeedImage({
        imageUrl: "https://go-irl.fun/social/feed-square.jpg",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe("instagram_publish_provider_failed:create:403:10");
    expect((thrown as Error).message).not.toContain("sensitive provider message");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("surfaces publish failure without retrying", async () => {
    configurePublisher();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: "container-123" }))
      .mockResolvedValueOnce(jsonResponse({
        error: {
          message: "raw provider detail must stay private",
          code: 4,
        },
      }, 500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishInstagramFeedImage({
      imageUrl: "https://go-irl.fun/social/feed-square.jpg",
    })).rejects.toThrow("instagram_publish_provider_failed:publish:500:4");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry an ambiguous transport failure", async () => {
    configurePublisher();
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(
      new TypeError("fetch failed with sensitive details"),
      { cause: { code: "ECONNRESET", address: "sensitive-address" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    await expect(publishInstagramFeedImage({
      imageUrl: "https://go-irl.fun/social/feed-square.jpg",
    })).rejects.toThrow("instagram_publish_transport_failed:create:ECONNRESET");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
