"use strict";
var Step = /** @class */ (function () {
    function Step(stepId, content, image, annotation) {
        this.name = stepId;
        this.contentContainer = content;
        this.active = false;
        this.annotation = annotation;
        this.images = [];
        if (image) {
            if (image instanceof HTMLElement) {
                // Handle list of images
                this.images.push(image);
            }
            else {
                // Handle single image
                this.images = Array.from(image);
            }
        }
        else
            throw new Error('No image found');
    }
    Step.prototype.show = function () {
        this.contentContainer.style.display = 'block';
        this.contentContainer.classList.add('active');
        this.annotation.activate();
        this.images.forEach(function (image) {
            image.classList.add('active');
        });
        this.active = true;
    };
    Step.prototype.hide = function () {
        this.contentContainer.style.display = 'none';
        this.annotation.deactivate();
        this.images.forEach(function (image) {
            image.classList.remove('active');
        });
        this.active = false;
    };
    Step.prototype.isActive = function () {
        return this.active;
    };
    return Step;
}());
var Annotation = /** @class */ (function () {
    function Annotation(name, paper, placement) {
        this.COLORS = {
            DASH_COLOR: '#d4d4d4',
            ACTIVE_COLOR: '#932D70',
            INACTIVE_COLOR: '#4183c4',
        };
        this.active = false;
        this.name = name;
        this.paper = paper;
        this.placement = {
            top: placement.top,
            left: placement.left,
            height: placement.height,
            width: placement.width,
            BOTTOM: 266,
        };
        this.target = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.extender = this.initLines();
        this.target = this.createCircle(this.placement.left, this.placement.top + this.placement.height, 7, {
            fill: this.COLORS.INACTIVE_COLOR,
        });
        this.paper.appendChild(this.target);
    }
    Annotation.prototype.initLines = function () {
        var line = this.createLine(this.placement.left, this.placement.top, this.placement.left, this.placement.top + this.placement.height);
        this.paper.appendChild(line);
        return line;
    };
    Annotation.prototype.activate = function () {
        console.log("Activatin'");
        this.target.setAttribute('fill', this.COLORS.ACTIVE_COLOR);
        this.extender.setAttribute('stroke', this.COLORS.ACTIVE_COLOR);
        this.extender.setAttribute('stroke-dasharray', 'none');
    };
    Annotation.prototype.deactivate = function () {
        console.log("Activatin'");
        this.target.setAttribute('fill', this.COLORS.INACTIVE_COLOR);
        this.extender.setAttribute('stroke', this.COLORS.DASH_COLOR);
        this.extender.setAttribute('stroke-dasharray', '3');
    };
    Annotation.prototype.createLine = function (x1, y1, x2, y2) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('stroke', this.COLORS.DASH_COLOR);
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
            _this.allSteps.push(new Step(step.name, _this.getStepDiv(step.name), document.querySelectorAll("[data-diagram-step=\"".concat(step.name, "\"]")), new Annotation(step.name, _this.diagramBaseSVG, step.placement)));
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
                console.log("clicked on annotation ".concat(step.name));
                _this.setStep(step.name);
            });
            step.images.forEach(function (image) {
                image.addEventListener('click', function (e) {
                    e.preventDefault();
                    console.log("clicked on annotation ".concat(step.name));
                    _this.setStep(step.name);
                });
            });
        });
        // annotations.forEach((annotation) => {
        //   annotation.target.addEventListener('click', (e) => {
        //     e.preventDefault()
        //     console.log(`clicked on annotation ${annotation.name}`)
        //     this.setStep(annotation.name)
        //   })
        // })
        // var diagramIcons = document.querySelectorAll(
        //   '.diagram-icon, .diagram-icon-small'
        // )
        // diagramIcons.forEach((icon) => {
        //   icon.addEventListener('click', (e) => {
        //     let step = icon.getAttribute('data-diagram-step')
        //     console.log(`clicked on ${step}`)
        //     if (step !== null) {
        //       this.setStep(step)
        //     } else {
        //       throw new Error(
        //         `data-diagram-step attribute doesn't exist for ${icon}`
        //       )
        //     }
        // changePanel(document.querySelector('.js-panel-content-' + step))
        // changeAnnotation(annotations, step)
        // })
        // })
    }
    InteractiveDiagram.prototype.setNextStep = function () {
        var _this = this;
        var currentStepIndex = this.allSteps.findIndex(function (step) { return step.name === _this.currentStep.name; });
        this.setStep(undefined, currentStepIndex + 1);
    };
    InteractiveDiagram.prototype.setPreviousStep = function () {
        var _this = this;
        // console.log('starting prev step calc')
        var currentStepIndex = this.allSteps.findIndex(function (step) { return step.name === _this.currentStep.name; });
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
            this.currentStep = this.allSteps.find(function (step) { return step.name === id; });
        }
        console.log("after calc bounds, step we want to show is ".concat(this.currentStep.name));
        this.showCurrentStep();
    };
    /**
     * Shows the current step and hides all other steps.
     */
    InteractiveDiagram.prototype.showCurrentStep = function () {
        var _this = this;
        console.log("showing step ".concat(this.currentStep.name));
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
    InteractiveDiagram.prototype.getStepDiv = function (step) {
        var element = document.querySelector("[data-step=\"".concat(step, "\"]"));
        if (element) {
            return element;
        }
        else {
            throw new Error("Step ".concat(step, " not found"));
        }
    };
    InteractiveDiagram.prototype.render = function () {
        return "Hello! I created a new instance of InteractiveDiagram. Here are the details:\n    contentDiv: ".concat(this.contentDiv.id, "\n    diagramBaseSVG: ").concat(this.diagramBaseSVG, "\n    currentStep: ").concat(this.currentStep.name, "\n    ");
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
