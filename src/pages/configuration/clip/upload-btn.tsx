import { JSX } from "preact"
interface UploadBtnOptions {
    onChange?: (url: string) => void;
}

export function UploadBtn<FC>({ onChange }: UploadBtnOptions) {

    function handleFileChange(evt: JSX.TargetedEvent<HTMLInputElement, Event>) {
        let files = evt.currentTarget.files;
        if (files?.length && onChange) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                onChange(url)
            }
            reader.readAsDataURL(files[0]);
        }
    }

    return <>
        <label className="w-full bg-primary text-white flex text-lg h-8 justify-center items-center leading-none rounded">
            <span>选择图片</span>
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>

    </>
}