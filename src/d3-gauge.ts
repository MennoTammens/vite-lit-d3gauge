import {html, svg, LitElement, PropertyValues} from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scaleLinear, ScaleLinear, select, easeSinOut, interpolateString, interpolateNumber } from 'd3'

/**
 * D3 Gauge Element
 */
@customElement('d3-gauge')
export class D3Gauge extends LitElement {
  protected createRenderRoot(): Element | ShadowRoot {
    return super.createRenderRoot();
  }
  @property({ type: Number })
  gaugeRadius = 200

  @property({ type: Number })
  minVal = 0

  @property({ type: Number })
  maxVal = 100

  @property({ type: Number })
  tickSpaceMinVal = 1

  @property({ type: Number })
  tickSpaceMajVal = 10

  @property({ type: String })
  id = 'vizBox'

  @property({ type: String })
  gaugeUnits = '%'

  @property({ type: Number })
  padding = 0.05

  @property({ type: Number })
  edgeWidth = 0.05

  @property({ type: Number })
  tickEdgeGap = 0.05

  @property({ type: Number })
  tickLengthMaj = 0.15

  @property({ type: Number })
  tickLengthMin = 0.05

  @property({ type: Number })
  needleTickGap = 0.05

  @property({ type: Number })
  needleLengthNeg = 0.2

  @property({ type: Number })
  pivotRadius = 0.1

  @property({ type: Number })
  ticknessGaugeBasis = 200

  @property({ type: Number })
  needleWidth = 5

  @property({ type: Number })
  tickWidthMaj = 3

  @property({ type: Number })
  tickWidthMin = 1

  @property({ type: Number })
  labelFontSize = 18

  @property({ type: Number })
  zeroTickAngle: number = 60

  @property({ type: Number })
  maxTickAngle = 300

  @property({ type: Number })
  zeroNeedleAngle = 40

  @property({ type: Number })
  maxNeedleAngle = 320

  @property({ type: String })
  tickColMaj = '#0099CC'

  @property({ type: String })
  tickColMin = '#000'

  @property({ type: String })
  outerEdgeCol = '#0099CC'

  @property({ type: String })
  pivotCol = '#999'

  @property({ type: String })
  innerCol = '#fff'

  @property({ type: String })
  unitsLabelCol = '#000'

  @property({ type: String })
  tickLabelCol = '#000'

  @property({ type: String })
  needleCol = '#0099CC'

  @property({ type: Array })
  ranges = []

  defaultFonts = '"Helvetica Neue", Helvetica, Arial, sans-serif'

  @property({ type: String })
  tickFont = this.defaultFonts

  @property({ type: String })
  unitsFont = this.defaultFonts

  @property({ type: Number })
  unitsOffset: number = 0

  @property({ type: Number })
  fractionDigits: number = 0

  @property({ type: Number })
  needleVal = this.minVal;

  //Define a linear scale to convert values to needle displacement angle (degrees)
  valueScale: ScaleLinear<number, number> = scaleLinear()
      .domain([this.minVal, this.maxVal])
      .range([this.zeroTickAngle, this.maxTickAngle]);
  originX = this.gaugeRadius;
  originY = this.gaugeRadius;

  shouldUpdate(changedProperties: PropertyValues) {
    if(changedProperties.size === 1 && changedProperties.has('needleVal')) {
      this.updated(changedProperties);
      return false;
    }
    return true;
  }

  render() {
    this.originX = this.gaugeRadius;
    this.originY = this.gaugeRadius;
    this.valueScale = scaleLinear()
        .domain([this.minVal, this.maxVal])
        .range([this.zeroTickAngle, this.maxTickAngle]);

    // Calculate absolute values
    const padding = this.padding * this.gaugeRadius;
    const edgeWidth = this.edgeWidth * this.gaugeRadius;
    const tickEdgeGap = this.tickEdgeGap * this.gaugeRadius;
    const tickLengthMaj = this.tickLengthMaj * this.gaugeRadius;
    const tickLengthMin = this.tickLengthMin * this.gaugeRadius;
    const needleTickGap = this.needleTickGap * this.gaugeRadius;
    const needleLengthNeg = this.needleLengthNeg * this.gaugeRadius;
    const pivotRadius = this.pivotRadius * this.gaugeRadius;

    const needleWidth = this.needleWidth * (this.gaugeRadius/this.ticknessGaugeBasis);
    const tickWidthMaj = this.tickWidthMaj * (this.gaugeRadius/this.ticknessGaugeBasis);
    const tickWidthMin = this.tickWidthMin * (this.gaugeRadius/this.ticknessGaugeBasis);
    let labelFontSize = this.labelFontSize * (this.gaugeRadius/this.ticknessGaugeBasis);

    //Calculate required values
    const needleLengthPos = this.gaugeRadius - padding - edgeWidth - tickEdgeGap - tickLengthMaj - needleTickGap;
    const needlePathLength = needleLengthNeg + needleLengthPos;
    const needlePathStart = needleLengthNeg * (-1);
    const outerTickRadius = this.gaugeRadius - padding - edgeWidth - tickEdgeGap;
    const tickStartMaj = outerTickRadius - tickLengthMaj;
    const tickStartMin = outerTickRadius - tickLengthMin;
    const labelStart = tickStartMaj - labelFontSize;
    const innerEdgeRadius = this.gaugeRadius - padding - edgeWidth;
    const outerEdgeRadius = this.gaugeRadius - padding;

    if(labelFontSize < 6) { labelFontSize = 0 }

    const rangePaths = this.ranges.map(([startVal, endVal, color]) => {
      const startAngle = this.valueScale(startVal) - 180;
      const endAngle = this.valueScale(endVal) - 180;
      const arc = describeArc(this.originX, this.originY, outerTickRadius, tickStartMaj, startAngle, endAngle);
      return svg`<path d="${arc}" style="stroke: none; fill: ${color};"></path>`
    })

    //Calculate tick mark angles (degrees)
    const tickAnglesMaj: number[] = [];
    const tickAnglesMin: number[] = [];
    const tickSpacingMajDeg = this.valueScale(this.tickSpaceMajVal) - this.valueScale(0);
    const tickSpacingMinDeg = this.valueScale(this.tickSpaceMinVal) - this.valueScale(0);
    const tickLabelText: string[] = [];

    let counter = 0;
    //Calculate major tick and tick mark label text
    for (let i = this.zeroTickAngle; i <= this.maxTickAngle; i = i + tickSpacingMajDeg) {
      tickAnglesMaj.push(this.zeroTickAngle + (tickSpacingMajDeg * counter))
      tickLabelText.push(`${this.minVal + (this.tickSpaceMajVal * counter)}`)
      counter++
    }
    counter = 0
    for (let i=this.zeroTickAngle; i <= this.maxTickAngle; i = i + tickSpacingMinDeg) {
      tickAnglesMin.push(this.zeroTickAngle + (tickSpacingMinDeg * counter))
      counter++
    }

    //Add the svg content holder to the visualisation box element in the document (vizbox)
    const svgWidth = this.gaugeRadius * 2;
    const svgHeight = this.gaugeRadius * 2;

    const pathTickMin = tickAnglesMin.map(d => {
      //Offset the tick mark angle so zero is vertically down, then convert to radians
      const tickAngle = d + 90;
      const tickAngleRad = dToR(tickAngle);

      const y1 = this.originY + (tickStartMin * Math.sin(tickAngleRad));
      const y2 = this.originY + ((tickStartMin + tickLengthMin) * Math.sin(tickAngleRad));
      const x1 = this.originX + (tickStartMin * Math.cos(tickAngleRad));
      const x2 = this.originX + ((tickStartMin + tickLengthMin) * Math.cos(tickAngleRad));

      return `M${x1},${y1}L${x2},${y2}`;
    });

    const pathTickMaj = tickAnglesMaj.map(d => {
      //Offset the tick mark angle so zero is vertically down, then convert to radians
      const tickAngle = d + 90;
      const tickAngleRad = dToR(tickAngle);

      const y1 = this.originY + (tickStartMaj * Math.sin(tickAngleRad));
      const y2 = this.originY + ((tickStartMaj + tickLengthMaj) * Math.sin(tickAngleRad));
      const x1 = this.originX + (tickStartMaj * Math.cos(tickAngleRad));
      const x2 = this.originX + ((tickStartMaj + tickLengthMaj) * Math.cos(tickAngleRad));

      return `M${x1},${y1}L${x2},${y2}`;
    });

    //Define functions to calculate the positions of the labels for the tick marks
    const tickLabels = tickAnglesMaj.map((d,i) => {
      const tickAngle = d+90;
      const tickAngleRad = dToR(tickAngle);
      const labelW = labelFontSize / (tickLabelText[i].toString().length / 2)
      const x = this.originX + ((labelStart - labelW) * Math.cos(tickAngleRad));
      const y = this.originY + ((labelStart) * Math.sin(tickAngleRad)) + (labelFontSize/2);
      return {x,y,l:tickLabelText[i]}
    });

    const needleAngle = this.zeroNeedleAngle;
    const nAngleRad = dToR(needleAngle + 90)
    const y1 = this.originY + (needlePathStart * Math.sin(nAngleRad));
    const y2 = this.originY + ((needlePathStart + needlePathLength) * Math.sin(nAngleRad));
    const x1 = this.originX + (needlePathStart * Math.cos(nAngleRad));
    const x2 = this.originX + ((needlePathStart + needlePathLength) * Math.cos(nAngleRad));
    const pathNeedle = `M${x1},${y1}L${x2},${y2}`;

    return html`
        <svg id="SVGbox-${this.id}" width="${svgWidth}" height="${svgHeight}">
            <g id="circles-${this.id}">
                <circle cx="${this.originX}" cy="${this.originY}" r="${outerEdgeRadius}" style="fill: ${this.outerEdgeCol}; stroke: none;"/>
                <circle cx="${this.originX}" cy="${this.originY}" r="${innerEdgeRadius}" style="fill: ${this.innerCol}; stroke: none;"/>
                ${rangePaths}
                <circle cx="${this.originX}" cy="${this.originY}" r="${pivotRadius}" style="fill: ${this.pivotCol}; stroke: none;"/>
            </g>
            <g id="tickMarks-${this.id}">
                <g id="minorTickMarks-${this.id}">
                    ${pathTickMin.map(p => svg`<path d="${p}" style="stroke: ${this.tickColMin}; stroke-width: ${tickWidthMin}px;"></path>`)}
                </g>
                <g id="majorTickMarks-${this.id}">
                    ${pathTickMaj.map(p => svg`<path d="${p}" style="stroke: ${this.tickColMaj}; stroke-width: ${tickWidthMaj}px;"></path>`)}
                </g>
            </g>
            <g id="tickLabels-${this.id}">
                ${tickLabels.map(({x, y, l}) => 
                   svg`<text x="${x}" y="${y}" font-size="${labelFontSize}" text-anchor="middle" style="fill: ${this.tickLabelCol}; font-weight: bold;" font-family="${this.tickFont}">${l}</text>`
                )}
            </g>
            <g id="unitLabels-${this.id}">
                <text x="${this.originX}" y="${this.originY + tickStartMaj + this.unitsOffset}" font-size="${labelFontSize * 2.5}" text-anchor="middle" style="fill: ${this.unitsLabelCol}}; font-weight: bold;" font-family="${this.unitsFont}">${this.gaugeUnits}</text>
            </g>
            <g id="titleLabels-${this.id}">
                <text x="${this.originX}" y="${this.originY * .75}" font-size="${labelFontSize * 1.5}" text-anchor="middle" style="fill: ${this.unitsLabelCol}}; font-weight: bold;" font-family="${this.unitsFont}">${this.title}</text>
            </g>
            <g id="needle-${this.id}">
                <path d="${pathNeedle}" style="stroke: ${this.needleCol}; stroke-width: ${needleWidth}"></path>
            </g>
      </svg>
    `
  }

  updated(changedProperties: PropertyValues) {
    const needleGroup = select(this.renderRoot.querySelector(`#needle-${this.id}`));
    const needlePath = needleGroup.selectAll("path");
    const { valueScale, zeroNeedleAngle, maxNeedleAngle, zeroTickAngle, maxTickAngle, originX, originY } = this;
    const oldVal = changedProperties.get('needleVal') || this.minVal;
    const newVal = this.needleVal;
    needlePath.transition()
      .duration(300)
      .ease(easeSinOut)
      .attrTween("transform", () => {
        let needleAngleOld = valueScale(oldVal) - zeroNeedleAngle;
        let needleAngleNew = valueScale(newVal) - zeroNeedleAngle;

        //Check for min/max ends of the needle
        if (needleAngleOld + zeroNeedleAngle > maxTickAngle){needleAngleOld = maxNeedleAngle - zeroNeedleAngle}
        if (needleAngleOld + zeroNeedleAngle < zeroTickAngle){needleAngleOld = 0}
        if (needleAngleNew + zeroNeedleAngle > maxTickAngle){needleAngleNew = maxNeedleAngle - zeroNeedleAngle}
        if (needleAngleNew + zeroNeedleAngle < zeroTickAngle){needleAngleNew = 0}
        const needleCentre = originX+","+originY
        return interpolateString("rotate(" + needleAngleOld + "," + needleCentre + ")", "rotate(" + needleAngleNew + "," + needleCentre + ")")
      });
    const unitLabels = select(this.renderRoot.querySelector(`#unitLabels-${this.id}`));
    const unitsLabel = unitLabels.selectAll("text");
    unitsLabel.transition()
      .duration(300)
      .ease(easeSinOut)
      .tween("text", () => {
        const i = interpolateNumber(oldVal, newVal)

        return (t: number) => {
          unitsLabel.text(i(t).toFixed(this.fractionDigits) + " " + this.gaugeUnits);
        };
      });
  }
}

function dToR(angleDeg: number){
  //Turns an angle in degrees to radians
  return angleDeg * (Math.PI / 180);
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number){
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);

  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, arcSweep, 0, endOuter.x, endOuter.y,
    "L", endInner.x,endInner.y,
    "A", innerRadius, innerRadius, 0, arcSweep, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

declare global {
  interface HTMLElementTagNameMap {
    'd3-gauge': D3Gauge
  }
}
