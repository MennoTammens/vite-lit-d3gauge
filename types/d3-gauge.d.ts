import { LitElement, PropertyValues } from 'lit';
import { ScaleLinear } from 'd3';
/**
 * D3 Gauge Element
 */
export declare class D3Gauge extends LitElement {
    protected createRenderRoot(): Element | ShadowRoot;
    gaugeRadius: number;
    minVal: number;
    maxVal: number;
    tickSpaceMinVal: number;
    tickSpaceMajVal: number;
    id: string;
    gaugeUnits: string;
    padding: number;
    edgeWidth: number;
    tickEdgeGap: number;
    tickLengthMaj: number;
    tickLengthMin: number;
    needleTickGap: number;
    needleLengthNeg: number;
    pivotRadius: number;
    ticknessGaugeBasis: number;
    needleWidth: number;
    tickWidthMaj: number;
    tickWidthMin: number;
    labelFontSize: number;
    zeroTickAngle: number;
    maxTickAngle: number;
    zeroNeedleAngle: number;
    maxNeedleAngle: number;
    tickColMaj: string;
    tickColMin: string;
    outerEdgeCol: string;
    pivotCol: string;
    innerCol: string;
    unitsLabelCol: string;
    tickLabelCol: string;
    needleCol: string;
    ranges: never[];
    defaultFonts: string;
    tickFont: string;
    unitsFont: string;
    needleVal: number;
    valueScale: ScaleLinear<number, number>;
    originX: number;
    originY: number;
    shouldUpdate(changedProperties: PropertyValues): boolean;
    render(): import("lit-html").TemplateResult<1>;
    updated(changedProperties: PropertyValues): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'd3-gauge': D3Gauge;
    }
}
