export function browseForFile(multiple: false, contentType?: string): Promise<File | null>;
export function browseForFile(multiple: true, contentType?: string): Promise<File[] | null>;
export function browseForFile(multiple: boolean, contentType?: string) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (contentType) {
      input.accept = contentType;
    }

    input.onchange = () => {
      if (input.files) {
        const files = Array.from(input.files);
        resolve(multiple ? files : files[0]);
      } else {
        resolve(null);
      }
    };

    input.click();
  });
}
