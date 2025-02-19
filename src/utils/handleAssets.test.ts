import { API } from "../configuration/api/api.configuration";
import { deleteAsset, handleAssets } from "./handleAssets";
import { TDAsset } from "@tldraw/tldraw";

describe("handleAssets", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  describe("when there are assets to restore", () => {
    describe("when fileRecordId can be read from src", () => {
      const setup = () => {
        const assetsBeforeCallback = [
          {
            id: "asset1",
          },
        ] as TDAsset[];
        const fileRecordId1 = "66cc39dff2ee1d14fef34bf7";
        const fileRecordId2 = "66cc39dff2ee1d14fef34bf8";
        const assetsAfterCallback = [
          {
            id: "asset1",
          },
          {
            id: "asset2",
            src: `/api/v3/file/download/${fileRecordId1}/filename.jpeg`,
          },
          {
            id: "asset3",
            src: `/api/v3/file/download/${fileRecordId2}/filename.jpeg`,
          },
        ] as TDAsset[];

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        return {
          fetchMock,
          fileRecordId1,
          fileRecordId2,
          assetsBeforeCallback,
          assetsAfterCallback,
        };
      };

      it("should call fetch with restore params", async () => {
        const {
          assetsBeforeCallback,
          assetsAfterCallback,
          fetchMock,
          fileRecordId1,
          fileRecordId2,
        } = setup();

        await handleAssets(assetsBeforeCallback, assetsAfterCallback);

        const fileRestoreUrl1 = API.FILE_RESTORE.replace(
          "FILERECORD_ID",
          fileRecordId1,
        );
        expect(fetchMock).toHaveBeenNthCalledWith(1, fileRestoreUrl1, {
          method: "POST",
        });

        const fileRestoreUrl2 = API.FILE_RESTORE.replace(
          "FILERECORD_ID",
          fileRecordId2,
        );
        expect(fetchMock).toHaveBeenNthCalledWith(2, fileRestoreUrl2, {
          method: "POST",
        });
      });
    });

    describe("when fileRecordId can not be read from src", () => {
      const setup = () => {
        const assetsBeforeCallback = [
          {
            id: "asset1",
          },
        ] as TDAsset[];
        const assetsAfterCallback = [
          {
            id: "asset1",
          },
          {
            id: "asset2",
            src: `/api/v3/file/download//filename.jpeg`,
          },
        ] as TDAsset[];

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        return {
          fetchMock,
          assetsBeforeCallback,
          assetsAfterCallback,
        };
      };

      it("should not call fetch", async () => {
        const { assetsBeforeCallback, assetsAfterCallback, fetchMock } =
          setup();

        await handleAssets(assetsBeforeCallback, assetsAfterCallback);

        expect(fetchMock).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("when there are assets to delete", () => {
    describe("when fileRecordId can be read from src", () => {
      const setup = () => {
        const fileRecordId1 = "66cc39dff2ee1d14fef34bf7";
        const fileRecordId2 = "66cc39dff2ee1d14fef34bf8";
        const assetsBeforeCallback = [
          {
            id: "asset1",
            src: `/api/v3/file/download/123/filename.jpeg`,
          },
          {
            id: "asset2",
            src: `/api/v3/file/download/${fileRecordId1}/filename.jpeg`,
          },
          {
            id: "asset3",
            src: `/api/v3/file/download/${fileRecordId2}/filename.jpeg`,
          },
        ] as TDAsset[];

        const assetsAfterCallback = [
          {
            id: "asset1",
          },
        ] as TDAsset[];

        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        return {
          fetchMock,
          fileRecordId1,
          fileRecordId2,
          assetsBeforeCallback,
          assetsAfterCallback,
        };
      };

      it("should call fetch with delete params", async () => {
        const {
          assetsBeforeCallback,
          assetsAfterCallback,
          fetchMock,
          fileRecordId1,
          fileRecordId2,
        } = setup();

        await handleAssets(assetsBeforeCallback, assetsAfterCallback);

        const fileDeleteUrl1 = API.FILE_DELETE.replace(
          "FILERECORD_ID",
          fileRecordId1,
        );
        expect(fetchMock).toHaveBeenNthCalledWith(1, fileDeleteUrl1, {
          method: "DELETE",
        });

        const fileDeleteUrl2 = API.FILE_DELETE.replace(
          "FILERECORD_ID",
          fileRecordId2,
        );
        expect(fetchMock).toHaveBeenNthCalledWith(2, fileDeleteUrl2, {
          method: "DELETE",
        });
      });

      describe("when fileRecordId can not be read from src", () => {
        const setup = () => {
          const assetsBeforeCallback = [
            {
              id: "asset1",
            },
            {
              id: "asset2",
              src: `/api/v3/file/download/filename.jpeg`,
            },
          ] as TDAsset[];

          const assetsAfterCallback = [
            {
              id: "asset1",
            },
          ] as TDAsset[];

          const fetchMock = vi.fn();
          vi.stubGlobal("fetch", fetchMock);

          return {
            fetchMock,
            assetsBeforeCallback,
            assetsAfterCallback,
          };
        };

        it("should not call fetch", async () => {
          const { assetsBeforeCallback, assetsAfterCallback, fetchMock } =
            setup();

          await handleAssets(assetsBeforeCallback, assetsAfterCallback);

          expect(fetchMock).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
});

describe("deleteAsset", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  describe("when fileRecordId can be read from src", () => {
    const setup = () => {
      const asset = {
        id: "asset1",
        src: `/api/v3/file/download/123/filename.jpeg`,
      } as TDAsset;

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      return {
        fetchMock,
        asset,
      };
    };

    it("should call fetch with delete params", async () => {
      const { asset, fetchMock } = setup();

      await deleteAsset(asset);

      const fileDeleteUrl = API.FILE_DELETE.replace("FILERECORD_ID", "123");
      expect(fetchMock).toHaveBeenCalledWith(fileDeleteUrl, {
        method: "DELETE",
      });
    });
  });

  describe("when fileRecordId can not be read from src", () => {
    const setup = () => {
      const asset = {
        id: "asset1",
        src: `/api/v3/file/download//filename.jpeg`,
      } as TDAsset;

      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      return {
        fetchMock,
        asset,
      };
    };

    it("should not call fetch", async () => {
      const { asset, fetchMock } = setup();

      await deleteAsset(asset);

      expect(fetchMock).toHaveBeenCalledTimes(0);
    });
  });
});
