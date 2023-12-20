"use strict";
var Step = /** @class */ (function () {
    function Step(stepId, element, annotation) {
        this.id = stepId;
        this.element = element;
        this.active = false;
        this.annotation = annotation;
    }
    Step.prototype.show = function () {
        this.element.style.display = 'block';
        this.element.classList.add('active');
        this.active = true;
    };
    Step.prototype.hide = function () {
        this.element.style.display = 'none';
        this.active = false;
    };
    Step.prototype.isActive = function () {
        return this.active;
    };
    return Step;
}());
var Annotation = /** @class */ (function () {
    function Annotation(name, paper, placement) {
        this.DASH_COLOR = '#d4d4d4';
        this.SOLID_COLOR = '#932D70';
        this.TARGET_COLOR = '#4183c4';
        this.BOTTOM = 266;
        this.active = false;
        this.name = name;
        this.paper = paper;
        this.top = placement.top;
        this.left = placement.left;
        this.height = placement.height;
        this.width = placement.width;
        this.target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.initLines();
        this.initTarget();
    }
    Annotation.prototype.initLines = function () {
        var _this = this;
        if (this.width) {
            this.lines = [
                this.createLine(this.left - this.width / 2, this.top + 30, this.left + this.width / 2, this.top + 30),
                this.createLine(this.left - this.width / 2, this.top, this.left - this.width / 2, this.top + 30),
                this.createLine(this.left + this.width / 2, this.top, this.left + this.width / 2, this.top + 30),
                (this.extender = this.createLine(this.left, this.top + 30, this.left, this.top + this.height)),
            ];
        }
        else {
            this.lines = [
                (this.extender = this.createLine(this.left, this.top, this.left, this.top + this.height)),
            ];
        }
        this.lines.forEach(function (line) {
            console.log("creating a line for ".concat(_this.name));
            _this.paper.appendChild(line);
        });
    };
    Annotation.prototype.createLine = function (x1, y1, x2, y2) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('stroke', this.DASH_COLOR);
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '3');
        return line;
    };
    Annotation.prototype.createCircle = function (x, y, r, attributes) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x.toString());
        circle.setAttribute('cy', y.toString());
        circle.setAttribute('r', r.toString());
        for (var key in attributes) {
            circle.setAttribute(key, attributes[key]);
        }
        return circle;
    };
    Annotation.prototype.initTarget = function () {
        this.targetOuter = this.createCircle(this.left, this.top + this.height, 7, {
            fill: this.TARGET_COLOR,
        });
        this.targetInner = this.createCircle(this.left, this.top + this.height, 5, {
            fill: this.TARGET_COLOR,
            'stroke-width': '2',
            stroke: '#fff',
        });
        // this.targetOuter.setAttribute('fill', this.TARGET_COLOR)
        // this.targetInner.setAttribute('fill', this.TARGET_COLOR)
        // this.targetInner.setAttribute('stroke-width', '2')
        // this.targetInner.setAttribute('stroke', '#fff')
        this.target.appendChild(this.targetOuter);
        this.target.appendChild(this.targetInner);
        // this.target!.appendChild(this.targetOuter)
        // this.target!.appendChild(this.targetInner)
        this.paper.appendChild(this.target);
        // this.paper.appendChild(this.targetOuter)
        // this.paper.appendChild(this.targetInner)
    };
    return Annotation;
}());
var InteractiveDiagram = /** @class */ (function () {
    /**
     * Creates an instance of InteractiveDiagram.
     *
     * @param contentDivId The id of the div that contains the content of the diagram
     * @param diagramBaseDivId The id of the div that contains the diagram base SVG
     * @param allDataSteps An array of strings that represent the data-step attribute of each step
     * @param previousControlId The id of the div that contains the previous button
     * @param nextControlId The id of the div that contains the next button
     */
    function InteractiveDiagram(contentDivId, diagramBaseDivId, steps, 
    // allDataSteps: string[],
    previousControlId, nextControlId) {
        var _this = this;
        // set internal vars
        this.contentDiv = this.getElementFromId(contentDivId);
        var element = this.getElementFromId('js-features-branch-diagram-svg');
        if (element instanceof SVGElement) {
            this.diagramBaseSVG = element;
        }
        else {
            throw new Error('Element is not an SVGElement');
        }
        this.allSteps = [];
        steps.forEach(function (step) {
            _this.allSteps.push(new Step(step.name, _this.getStepDivs(step.name), new Annotation(step.name, _this.diagramBaseSVG, step.placement)));
        });
        // set controls
        this.previousControl = this.getElementFromId(previousControlId);
        this.nextControl = this.getElementFromId(nextControlId);
        this.previousControl.addEventListener('click', function (e) {
            e.preventDefault();
            // set the step to the index of the next Step object in allSteps[]
            _this.setPreviousStep();
        });
        this.nextControl.addEventListener('click', function (e) {
            e.preventDefault();
            _this.setNextStep();
            // find the id of the next step in steps[]
        });
        // set initial step and get all the steps ready
        // this.currentStep = this.allSteps[0]
        // TODO programmatically set to index0
        this.currentStep = this.allSteps[0];
        this.setStep('branch');
        // let annotations = [
        //   new Annotation('branch', this.diagramBaseSVG, {
        //     top: 20,
        //     left: 88,
        //     height: 207,
        //   }),
        //   new Annotation('commits', this.diagramBaseSVG, {
        //     top: 140,
        //     left: 289,
        //     height: 86,
        //     width: 113,
        //   }),
        //   new Annotation('pr', this.diagramBaseSVG, {
        //     top: 137,
        //     left: 423,
        //     height: 89,
        //   }),
        //   new Annotation('code-review', this.diagramBaseSVG, {
        //     top: 140,
        //     left: 550,
        //     height: 86,
        //     width: 145,
        //   }),
        //   new Annotation('deploy', this.diagramBaseSVG, {
        //     top: 137,
        //     left: 688,
        //     height: 89,
        //   }),
        //   new Annotation('merge', this.diagramBaseSVG, {
        //     top: 20,
        //     left: 840,
        //     height: 207,
        //   }),
        // ]
        this.allSteps.forEach(function (step) {
            step.annotation.target.addEventListener('click', function (e) {
                e.preventDefault();
                console.log("clicked on annotation ".concat(step.id));
                _this.setStep(step.id);
            });
        });
        // annotations.forEach((annotation) => {
        //   annotation.target.addEventListener('click', (e) => {
        //     e.preventDefault()
        //     console.log(`clicked on annotation ${annotation.name}`)
        //     this.setStep(annotation.name)
        //   })
        // })
        var diagramIcons = document.querySelectorAll('.diagram-icon, .diagram-icon-small');
        diagramIcons.forEach(function (icon) {
            icon.addEventListener('click', function (e) {
                var step = icon.getAttribute('data-diagram-step');
                console.log("clicked on ".concat(step));
                if (step !== null) {
                    _this.setStep(step);
                }
                else {
                    throw new Error("data-diagram-step attribute doesn't exist for ".concat(icon));
                }
                // changePanel(document.querySelector('.js-panel-content-' + step))
                // changeAnnotation(annotations, step)
            });
        });
    }
    InteractiveDiagram.prototype.setNextStep = function () {
        var _this = this;
        var currentStepIndex = this.allSteps.findIndex(function (step) { return step.id === _this.currentStep.id; });
        this.setStep(undefined, currentStepIndex + 1);
    };
    InteractiveDiagram.prototype.setPreviousStep = function () {
        var _this = this;
        // console.log('starting prev step calc')
        var currentStepIndex = this.allSteps.findIndex(function (step) { return step.id === _this.currentStep.id; });
        // console.log(
        //   `currentStepIndex is ${currentStepIndex}, figuring out what's prev`
        // )
        this.setStep(undefined, currentStepIndex - 1);
    };
    /**
     * Sets the current step of the diagram and changes the visibility of all steps accordingly.
     *
     * @param index The index of the step to set, if not provided, the currentStepIndex will be used
     */
    InteractiveDiagram.prototype.setStep = function (id, index) {
        console.log("looking to set the step to ".concat(id, " or ").concat(index));
        if (index !== undefined) {
            index = Math.max(0, Math.min(index, this.allSteps.length - 1));
            this.currentStep = this.allSteps[index];
        }
        else if (id) {
            this.currentStep = this.allSteps.find(function (step) { return step.id === id; });
        }
        console.log("after calc bounds, step we want to show is ".concat(this.currentStep.id));
        this.showCurrentStep();
    };
    /**
     * Shows the current step and hides all other steps.
     */
    InteractiveDiagram.prototype.showCurrentStep = function () {
        var _this = this;
        console.log("showing step ".concat(this.currentStep.id));
        this.allSteps.forEach(function (step) {
            if (step === _this.currentStep) {
                step.show();
            }
            else {
                step.hide();
            }
        });
    };
    /**
     * Provides an HTMLElement from an id.
     *
     * @param id The id of the div to get
     * @returns The HTMLElement that matches the provided id
     */
    InteractiveDiagram.prototype.getElementFromId = function (id) {
        var element = document.getElementById(id);
        if (element) {
            return element;
        }
        else {
            throw new Error("Element with id ".concat(id, " not found"));
        }
    };
    /**
     * Lets you get an array of HTMLElements that match the provided array of data-step attributes.
     *
     * @param steps An array of strings that represent the data-step attribute of each step
     * @returns An array of HTMLElements that match the provided data-step attributes
     */
    InteractiveDiagram.prototype.getStepDivs = function (step) {
        var element = document.querySelector("[data-step=\"".concat(step, "\"]"));
        if (element) {
            return element;
        }
        else {
            throw new Error("Step ".concat(step, " not found"));
        }
    };
    InteractiveDiagram.prototype.render = function () {
        return "Hello! I created a new instance of InteractiveDiagram. Here are the details:\n    contentDiv: ".concat(this.contentDiv.id, "\n    diagramBaseSVG: ").concat(this.diagramBaseSVG, "\n    currentStep: ").concat(this.currentStep.id, "\n    ");
    };
    return InteractiveDiagram;
}());
var githubFlow = new InteractiveDiagram('flow-content', 'scrollable-diagram', 
// Each step should actually contain (maybe a Step)
// - an id of the div that contains the step content
// - the SVG that illustrates the step
// - a position to target the annotation (x,y)
[
    { name: 'branch', placement: { top: 20, left: 88, height: 207 } },
    {
        name: 'commits',
        placement: { top: 140, left: 289, height: 86, width: 113 },
    },
    { name: 'pr', placement: { top: 137, left: 423, height: 89 } },
    {
        name: 'code-review',
        placement: { top: 140, left: 550, height: 86, width: 145 },
    },
    { name: 'deploy', placement: { top: 137, left: 688, height: 89 } },
    { name: 'merge', placement: { top: 20, left: 840, height: 207 } },
], 
// ['branch', 'commits', 'pr', 'code-review', 'deploy', 'merge'],
'previous', 'next');
console.log(githubFlow.render());
