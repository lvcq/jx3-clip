import { DividerH } from "@components/divider-h";
import { FormItem } from "@components/form-item";
import { SubTitle } from "@components/sub-title";
import { BodyType, bodyTypeRefs } from "@data/body-type";
import { Part, partRefs } from "@data/part";
import { JSX } from "preact";
import { route } from "preact-router";

interface FilterFieldProps {
    checkedBodyTypes?: Array<BodyType>;
    checkedParts?: Array<Part>;
    onBodyTypesChange?: (types: Array<BodyType>) => void;
    onPartsChange?: (parts: Array<Part>) => void;
}
export function FilterField<FC>({ checkedBodyTypes, checkedParts, onBodyTypesChange, onPartsChange }: FilterFieldProps) {

    function handleBodyTypesChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let value = Number(evt.currentTarget.value);
        let checked = evt.currentTarget.checked;
        let nextChecked = [...(checkedBodyTypes || [])];
        if (checked) {
            nextChecked.push(value);
        } else {
            nextChecked = nextChecked.filter(item => item !== value);
        }
        if (onBodyTypesChange) {
            onBodyTypesChange(nextChecked);
        }
    }

    function handlePartsChange(evt: JSX.TargetedEvent<HTMLInputElement>) {
        let value = Number(evt.currentTarget.value);
        let checked = evt.currentTarget.checked;
        let nextChecked = [...(checkedParts || [])];
        if (checked) {
            nextChecked.push(value);
        } else {
            nextChecked = nextChecked.filter(item => item !== value);
        }
        if (onPartsChange) {
            onPartsChange(nextChecked);
        }
    }

    function handleCreateNewClick() {
        route("/config/clip/edit");
    }

    return <div className="px-3 py-4">
        <div className="text-center">
            <button
                className="w-3/4 bg-primary text-white h-9 leading-9 hover:ring-2 ring-blue-300" onClick={handleCreateNewClick}>新建裁剪配置</button>
        </div>
        <DividerH />
        <SubTitle>筛选条件</SubTitle>
        <FormItem label="体型">
            {bodyTypeRefs.map(item => {
                return <label className="mr-2">
                    <input
                        key={item.key}
                        className="mr-1"
                        name="bodyType"
                        checked={checkedBodyTypes && checkedBodyTypes.includes(item.key)}
                        value={item.key}
                        type="checkbox"
                        onChange={handleBodyTypesChange} />
                    {item.label}
                </label>
            })}
        </FormItem>
        <FormItem label="部位">
            {partRefs.map(item => {
                return <label className="mr-2">
                    <input key={item.key}
                        name="part"
                        value={item.key}
                        className="mr-1"
                        type="checkbox"
                        checked={checkedParts && checkedParts.includes(item.key)}
                        onChange={handlePartsChange} />
                    {item.label}
                </label>
            })}
        </FormItem>
    </div>
}