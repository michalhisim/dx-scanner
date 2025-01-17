import { MetadataType } from './model';
import { VirtualFileSystemService } from './VirtualFileSystemService';
import { VirtualDirectory } from './IVirtualFileSystemService';

describe('FileSystemService', () => {
  let service: VirtualFileSystemService;

  beforeAll(async () => {
    service = new VirtualFileSystemService();
  });

  beforeEach(async () => {
    const structure: VirtualDirectory = {
      type: MetadataType.dir,
      children: {
        src: {
          type: MetadataType.dir,
          children: {
            'index.ts': {
              type: MetadataType.file,
              data: '...',
            },
            '.foo': {
              type: MetadataType.file,
              data: '...',
            },
            lib: {
              type: MetadataType.dir,
              children: {},
            },
            'indexSL.ts': {
              type: MetadataType.symlink,
              target: 'index.ts',
            },
            'indexSLbroken.ts': {
              type: MetadataType.symlink,
              target: 'non-existing-file.ts',
            },
          },
        },
        srcSL: {
          type: MetadataType.symlink,
          target: 'src',
        },
      },
    };

    service.setFileSystem(structure);
  });

  afterEach(async () => {
    service.clearFileSystem();
  });

  describe('#exists', () => {
    it('returns true if the file exists', async () => {
      const result = await service.exists('/src/index.ts');
      expect(result).toBe(true);
    });

    it('returns true if the directory is a root directory', async () => {
      const result = await service.exists('/');
      expect(result).toBe(true);
    });

    it('returns true if the directory exists on absolute path', async () => {
      const result = await service.exists('/src');
      expect(result).toBe(true);
    });

    it('returns true if the directory exists on relative path', async () => {
      service.setFileSystem({
        type: MetadataType.dir,
        children: {
          src: {
            type: MetadataType.dir,
            children: {},
          },
        },
      });

      const result = await service.exists('src');
      expect(result).toBe(true);
    });

    it('returns true if the symbolic link exists', async () => {
      const result = await service.exists('/src/indexSL.ts');
      expect(result).toBe(true);
    });

    it('returns false if the broken symbolic link exists', async () => {
      const result = await service.exists('/src/indexSLbroken.ts');
      expect(result).toBe(false);
    });

    it("returns false if the file doesn't exists", async () => {
      const result = await service.exists('/non/existing/file.ts');
      expect(result).toBe(false);
    });
  });

  describe('#readDirectory', () => {
    it('returns array of files after calling readDirectory()', async () => {
      const result = await service.readDirectory('/src');
      expect(result.length).toEqual(5);
    });

    it('follows symbolic links', async () => {
      const result = await service.readDirectory('/srcSL');
      expect(result.length).toEqual(5);
    });

    it("throws an error if the target doesn't exist", async () => {
      await expect(service.readDirectory('/non/existing/file.ts')).rejects.toThrow('No such file or directory');
    });

    it('throws an error if the target is a file', async () => {
      await expect(service.readDirectory('/src/index.ts')).rejects.toThrow('Is not a directory');
    });

    it('throws an error if the target is a broken symbolic link', async () => {
      await expect(service.readDirectory('/src/indexSLbroken.ts')).rejects.toThrow('No such file or directory');
    });
  });

  describe('#readFile', () => {
    it('should return text (string) after calling readFile()', async () => {
      const result = await service.readFile('/src/index.ts');
      expect(typeof result).toBe('string');
    });

    it('follows symbolic links', async () => {
      const result = await service.readFile('/src/indexSL.ts');
      expect(typeof result).toBe('string');
    });

    it("throws an error if the target doesn't exist", async () => {
      await expect(service.readFile('/non/existing/file.ts')).rejects.toThrow('No such file or directory');
    });

    it("throws an error if the target isn't a file", async () => {
      await expect(service.readFile('/src')).rejects.toThrow('Is not a file');
    });

    it('throws an error if the target is a broken symbolic link', async () => {
      await expect(service.readFile('/src/indexSLbroken.ts')).rejects.toThrow('No such file or directory');
    });
  });

  describe('#writeFile', () => {
    it('correctly writes to the file', async () => {
      const stringToWrite = "const toWrite = 'written';";

      await service.writeFile('/non-existing-file.ts', stringToWrite);

      const finalContent = await service.readFile('/non-existing-file.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.deleteFile('/non-existing-file.ts');
    });

    it('correctly rewrites a file', async () => {
      const stringToWrite = "const toRewrite = 'rewritten';";
      const previousContent = await service.readFile('/src/index.ts');

      await service.writeFile('/src/index.ts', stringToWrite);

      const finalContent = await service.readFile('/src/index.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.writeFile('/src/index.ts', previousContent);
    });

    it('correctly writes to a symbolic link', async () => {
      const stringToWrite = "const toWrite = 'written';";
      const previousContent = await service.readFile('/src/index.ts');

      await service.writeFile('/src/indexSL.ts', stringToWrite);

      const finalContent = await service.readFile('/src/index.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.writeFile('/src/index.ts', previousContent);
    });

    it('correctly writes to a broken symbolic link', async () => {
      const stringToWrite = "const toWrite = 'written';";

      await service.writeFile('/src/indexSLbroken.ts', stringToWrite);

      const finalContent = await service.readFile('/src/non-existing-file.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.deleteFile('/src/non-existing-file.ts');
    });

    it("throws an error if the parent directory doesn't exist", async () => {
      await expect(service.writeFile('/non/existing/file.ts', '...')).rejects.toThrow('is not a directory');
    });

    it('throws an error if the parent directory is not a directory', async () => {
      await expect(service.writeFile('/src/index.ts/file.ts', '...')).rejects.toThrow('is not a directory');
    });

    it("throws an error if the target isn't a file", async () => {
      await expect(service.writeFile('/src', '...')).rejects.toThrow('is not a file');
    });
  });

  describe('#createFile', () => {
    it('creates a file if it does not exist yet', async () => {
      const stringToWrite = "const toWrite = 'written';";

      await service.createFile('/non-existing-file.ts', stringToWrite);

      const finalContent = await service.readFile('/non-existing-file.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.deleteFile('/non-existing-file.ts');
    });

    it('appends data to a file if it exists already', async () => {
      const stringToWrite = "const toAppend = 'appended';";
      const previousContent = await service.readFile('/src/index.ts');

      await service.createFile('/src/index.ts', stringToWrite);

      const finalContent = await service.readFile('/src/index.ts');
      expect(finalContent).toEqual(previousContent + stringToWrite);

      await service.writeFile('/src/index.ts', previousContent);
    });

    it('appends data to a symbolic link', async () => {
      const stringToWrite = "const toAppend = 'appended';";
      const previousContent = await service.readFile('/src/index.ts');

      await service.createFile('/src/indexSL.ts', stringToWrite);

      const finalContent = await service.readFile('/src/index.ts');
      expect(finalContent).toEqual(previousContent + stringToWrite);

      await service.writeFile('/src/index.ts', previousContent);
    });

    it('creates a file if the symbolic link is broken', async () => {
      const stringToWrite = "const toWrite = 'written';";

      await service.createFile('/src/indexSLbroken.ts', stringToWrite);

      const finalContent = await service.readFile('/src/non-existing-file.ts');
      expect(finalContent).toEqual(stringToWrite);

      await service.deleteFile('/src/non-existing-file.ts');
    });

    it("throws an error if the parent directory doesn't exist", async () => {
      await expect(service.createFile('/non/existing/file.ts', '...')).rejects.toThrow('is not a directory');
    });

    it('throws an error if the parent directory is not a directory', async () => {
      await expect(service.createFile('/src/index.ts/file.ts', '...')).rejects.toThrow('is not a directory');
    });

    it("throws an error if the target isn't a file", async () => {
      await expect(service.createFile('/src', '...')).rejects.toThrow('is not a file');
    });
  });

  describe('#deleteFile', () => {
    it('returns false after calling exists() when the file is deleted', async () => {
      const fileToDelete = '/fileToDelete.ts';

      await service.createFile(fileToDelete, '..');
      await service.deleteFile(fileToDelete);

      const existsFile = await service.exists(fileToDelete);
      expect(existsFile).toBe(false);
    });

    it('returns false after calling exists() when the symbolic link is deleted', async () => {
      const fileToDelete = '/src/indexSL.ts';

      await service.deleteFile(fileToDelete);

      await expect(service.isSymbolicLink(fileToDelete)).rejects.toThrow('no such file or directory');
    });

    it('returns false after calling exists() when the broken symbolic link is deleted', async () => {
      const fileToDelete = '/src/indexSLbroken.ts';

      await service.deleteFile(fileToDelete);

      await expect(service.isSymbolicLink(fileToDelete)).rejects.toThrow('no such file or directory');
    });

    it("throws an error if the target doesn't exist", async () => {
      await expect(service.deleteFile('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });

    it("throws an error if the target isn't a file", async () => {
      await expect(service.deleteFile('/src')).rejects.toThrow('Is not a file');
    });
  });

  describe('#createDirectory', () => {
    it('exists() returns true after creating directory', async () => {
      await service.createDirectory('/src/newDir');

      const existsDir = await service.exists('/src/newDir');
      expect(existsDir).toBe(true);

      await service.deleteDirectory('/src/newDir');
    });

    it("throws an error if the parent directory doesn't exist", async () => {
      await expect(service.createDirectory('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });

    it('throws an error if the parent directory is not a directory', async () => {
      await expect(service.createDirectory('/src/index.ts/newDir')).rejects.toThrow('is not a directory');
    });

    it('throws an error if the target is a directory', async () => {
      await expect(service.createDirectory('/src')).rejects.toThrow('Dir already exists');
    });

    it("throws an error if the target isn't a directory", async () => {
      await expect(service.createDirectory('/src/index.ts')).rejects.toThrow('Dir already exists');
    });

    it('throws an error if the target is a broken symbolic link', async () => {
      await expect(service.createDirectory('/src/indexSLbroken.ts')).rejects.toThrow('Dir already exists');
    });
  });

  describe('#deleteDirectory', () => {
    it('exists() returns false after deleting', async () => {
      const dirToDelete = '/dirToDelete';

      await service.createDirectory(dirToDelete);
      let existsDir = await service.exists(dirToDelete);
      expect(existsDir).toBe(true);

      await service.deleteDirectory(dirToDelete);

      existsDir = await service.exists(dirToDelete);
      expect(existsDir).toBe(false);
    });

    it("throws an error if the target doesn't exist", async () => {
      await expect(service.deleteDirectory('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });

    it("throws an error if the target isn't a directory", async () => {
      await expect(service.deleteDirectory('/src/index.ts')).rejects.toThrow('Is not a directory');
    });

    it('throws an error if the target is a symbolic link to a directory', async () => {
      await expect(service.deleteDirectory('/srcSL')).rejects.toThrow('Is not a directory');
    });
  });

  describe('#getMetadata', () => {
    it('it returns metadata for Folder', async () => {
      const result = await service.getMetadata('/src/lib');

      expect(result.baseName).toEqual('lib');
      expect(result.extension).toEqual(undefined);
      expect(result.name).toMatch('lib');
      expect(result.path).toMatch(/src\/lib/);
      expect(typeof result.size).toBe('number');
      expect(result.type).toEqual(MetadataType.dir);
    });

    it('it returns metadata for File', async () => {
      const result = await service.getMetadata('/src/index.ts');

      expect(result.baseName).toEqual('index');
      expect(result.extension).toEqual('.ts');
      expect(result.name).toEqual('index.ts');
      expect(result.path).toMatch(/src\/index.ts/);
      expect(typeof result.size).toBe('number');
      expect(result.type).toEqual(MetadataType.file);
    });

    it('it returns metadata for dotfile', async () => {
      const result = await service.getMetadata('/src/.foo');

      expect(result.baseName).toEqual('.foo');
      expect(result.extension).toEqual(undefined);
      expect(result.name).toEqual('.foo');
      expect(result.path).toMatch(/src\/\.foo/);
      expect(typeof result.size).toBe('number');
      expect(result.type).toEqual(MetadataType.file);
    });

    it('it returns metadata for Symlink', async () => {
      const result = await service.getMetadata('/src/indexSL.ts');

      expect(result.baseName).toEqual('indexSL');
      expect(result.extension).toEqual('.ts');
      expect(result.name).toEqual('indexSL.ts');
      expect(result.path).toMatch(/src\/indexSL\.ts/);
      expect(typeof result.size).toBe('number');
      expect(result.type).toEqual(MetadataType.symlink);
    });

    it('it returns metadata for broken Symlink', async () => {
      const result = await service.getMetadata('/src/indexSLbroken.ts');

      expect(result.baseName).toEqual('indexSLbroken');
      expect(result.extension).toEqual('.ts');
      expect(result.name).toEqual('indexSLbroken.ts');
      expect(result.path).toMatch(/src\/indexSLbroken\.ts/);
      expect(typeof result.size).toBe('number');
      expect(result.type).toEqual(MetadataType.symlink);
    });

    it("throws an error if the target doesn't exist", async () => {
      await expect(service.getMetadata('/non-existing-file.ts')).rejects.toThrow('no such file or directory');
    });
  });

  describe('#isFile', () => {
    it('should return file', async () => {
      const result = await service.isFile('/src/index.ts');
      expect(result).toBe(true);
    });

    it('should return false if the path is a symbolic link', async () => {
      const result = await service.isFile('/src/indexSL.ts');
      expect(result).toBe(false);
    });

    it("should throw an error if the target doesn't exist", async () => {
      await expect(service.isFile('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });
  });

  describe('#isDirectory', () => {
    it('should return true if the target is a directory', async () => {
      const dirPath = '/src';
      const result = await service.isDirectory(dirPath);

      expect(result).toBe(true);
    });

    it('should return false if the path is a symbolic link', async () => {
      const result = await service.isDirectory('/src/indexSL.ts');
      expect(result).toBe(false);
    });

    it("should throw an error if the target doesn't exist", async () => {
      await expect(service.isDirectory('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });
  });

  describe('#isSymbolicLink', () => {
    it('should return true if the target is a symbolic link', async () => {
      const result = await service.isSymbolicLink('/src/indexSL.ts');

      expect(result).toEqual(true);
    });

    it('should return false if the target is not a directory', async () => {
      const dirPath = '/src';
      const result = await service.isSymbolicLink(dirPath);

      expect(result).toBe(false);
    });

    it("should throw an error if the target doesn't exist", async () => {
      await expect(service.isSymbolicLink('/non/existing/file.ts')).rejects.toThrow('is not a directory');
    });
  });

  describe('#flatTraverse', () => {
    it('returns keys of metadata of every result', async () => {
      let files: string[] = [];

      await service.flatTraverse('/src', (meta) => {
        files.push(meta.name);
      });

      expect(files.length).toEqual(5);
      expect(files).toContain('index.ts');
      expect(files).toContain('.foo');
      expect(files).toContain('lib');
      expect(files).toContain('indexSL.ts');
      expect(files).toContain('indexSLbroken.ts');
    });

    it('stops on false', async () => {
      let files: string[] = [];

      await service.flatTraverse('/src', (meta) => {
        files.push(meta.name);
        return false;
      });

      expect(files.length).toEqual(1);
    });

    it('follows the root symbolic links', async () => {
      let files: string[] = [];

      await service.flatTraverse('/srcSL', (meta) => {
        files.push(meta.name);
      });

      expect(files.length).toEqual(5);
      expect(files).toContain('index.ts');
      expect(files).toContain('.foo');
      expect(files).toContain('lib');
      expect(files).toContain('indexSL.ts');
      expect(files).toContain('indexSLbroken.ts');
    });

    it("throws an error if the root doesn't exist", async () => {
      await expect(service.flatTraverse('/non/existing/file.ts', () => true)).rejects.toThrow('No such file or directory');
    });

    it("throws an error if the root isn't a directory", async () => {
      await expect(service.flatTraverse('/src/index.ts', () => true)).rejects.toThrow('Is not a directory');
    });

    it('throws an error if the root is a broken symbolic link', async () => {
      await expect(service.flatTraverse('/src/indexSLbroken.ts', () => true)).rejects.toThrow('No such file or directory');
    });
  });
});
