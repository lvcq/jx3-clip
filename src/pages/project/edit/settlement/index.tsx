import { FormItem } from "@components/form-item";
import { Modal } from "@components/global-modal";
import { SubTitle } from "@components/sub-title";
import { useAtom } from "jotai";
import { hairConfigAtom, clothesConfigAtom } from "@store/project.store"
import { useEffect, useState } from "preact/hooks";
import { ChangeEvent, TargetedEvent } from "preact/compat";
import { DividerH } from "@components/divider-h";

interface SettlementProps {
    visible?: boolean
    onOk?: () => Promise<void>
    onClose?: () => void
}

export function Settlement({ visible, onOk, onClose }: SettlementProps) {
    const [hairPrice, updateHairPrice] = useState(1);
    const [hairUnit, updateHairUnit] = useState(1);
    const [hairConfig] = useAtom(hairConfigAtom);

    const [clothesPrice, updateClothesPrice] = useState(1);
    const [clothesUnit, updateClothesUnit] = useState(1);
    const [clothesConfig] = useAtom(clothesConfigAtom);

    const [hairTotal, updateHairTotal] = useState(0);
    const [clothesTotal, updateClothesTotal] = useState(0);

    useEffect(() => {
        if (!visible) {
            return;
        }
        let total = Math.round(hairConfig.images.length * hairPrice * 100 / hairUnit) / 100;
        updateHairTotal(total);
    }, [visible, hairConfig.images.length, hairPrice, hairUnit]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        let total = Math.round(clothesConfig.images.length * clothesPrice * 100 / clothesUnit) / 100;
        updateClothesTotal(total);
    }, [visible, clothesConfig.images.length, clothesPrice, clothesUnit])

    function parseStringToInteger(source: string): number {
        let num = parseInt(source, 10) || 0
        return num >= 0 ? num : 0;
    }

    function handleHairPriceChange(event: TargetedEvent<HTMLInputElement, ChangeEvent>) {
        let num = parseStringToInteger(event.currentTarget.value);
        updateHairPrice(num);
    }

    function handleHairUnitChange(event: TargetedEvent<HTMLInputElement, ChangeEvent>) {
        let num = parseStringToInteger(event.currentTarget.value);
        updateHairUnit(num);
    }

    function handleClothesPriceChange(event: TargetedEvent<HTMLInputElement, ChangeEvent>) {
        let num = parseStringToInteger(event.currentTarget.value);
        updateClothesPrice(num);
    }

    function handleClothesUnitChange(event: TargetedEvent<HTMLInputElement, ChangeEvent>) {
        let num = parseStringToInteger(event.currentTarget.value);
        updateClothesUnit(num);
    }

    return <Modal visible={visible} title="结算" onOk={onOk} onClose={onClose}>
        <div className="w-96">
            <SubTitle>头发</SubTitle>
            <FormItem label="头发数量"><span>{hairConfig.images.length}</span></FormItem>
            <FormItem label="价格">
                <div>
                    <input type="number" className="w-16 text-center" value={hairPrice} min={0} onChange={handleHairPriceChange} />
                    <span className="px-1">元</span>
                    <input type="number" className="w-16 text-center" value={hairUnit} min={1} onChange={handleHairUnitChange} />
                    <span className="px-1">个</span>
                </div>
            </FormItem>
            <SubTitle>衣服</SubTitle>
            <FormItem label="衣服数量"><span>{clothesConfig.images.length}</span></FormItem>
            <FormItem label="价格">
                <div>
                    <input type="number" className="w-16 text-center" value={clothesPrice} min={0} onChange={handleClothesPriceChange} />
                    <span className="px-1">元</span>
                    <input type="number" className="w-16 text-center" value={clothesUnit} min={1} onChange={handleClothesUnitChange} />
                    <span className="px-1">个</span>
                </div>
            </FormItem>
            <DividerH />
            <SubTitle>合计</SubTitle>
            <FormItem label="总价">
                <div className="text-red-500">
                    <span className="px-1">{hairTotal.toFixed(2)}</span>
                    <span>+</span>
                    <span className="px-1">{clothesTotal.toFixed(2)}</span>
                    <span>=</span>
                    <span className="px-1">{(hairTotal + clothesTotal).toFixed(2)}</span>
                    <span>元</span>
                </div>
            </FormItem>
        </div>
    </Modal>
}