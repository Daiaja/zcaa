/////////////////////////////////////////////////////////////////////////////////
// NOTE: These need to match the enums in ScreenUIElementReticle.h
const ReticlePrimaryType =
{
  kInvalidIndex: -1,
  kDefault: 0,
  kWebline: 1,
  kDot: 2,
  kCount: 3
}
const ReticleSubType =
{
  kInvalidIndex: -1,
  kDefault: 0,
  kEnemy: 1,
  kTarget: 2,
  kElectric: 3,
  kAlly: 4,
  kCount: 5
}

var RETICLE_PRIMARY_TYPE_FRAME_LABELS = 
[
  "default",
  "webline",
  "dot"
];
var RETICLE_SUB_TYPE_FRAME_LABELS = 
[
  "default",
  "enemy",
  "target",
  "electric",
  "ally"
];

/////////////////////////////////////////////////////////////////////////////////
// data-bind-reticle-sub-type-frame
/////////////////////////////////////////////////////////////////////////////////
class AttributeHandlerReticleSubTypeFrame 
{  
  init(element, value) 
  {
    this.currentSubType = ReticleSubType.kInvalidIndex;
  }
  deinit(element) {}
  
  update(element, value) 
  {
    if (this.currentType == value) { return; }
    if (value <= ReticleSubType.kInvalidIndex || value >= ReticleSubType.kCount) { return; }

    this.currentType = value;

    let frame_label = RETICLE_SUB_TYPE_FRAME_LABELS[value];
    if (isFrameLabelValid(element, frame_label))
    {
      CLAnimations.gotoAndStop(frame_label, element);
      //console.log("[ScreenUI.js::AttributeHandlerReticleTypeFrame] Set frame label to '" + frame_label + "'");
    }
    else if (isFrameLabelValid(element, "default"))
    {
      CLAnimations.gotoAndStop("default", element);
      //console.log("[ScreenUI.js::AttributeHandlerReticleTypeFrame] Set frame label to 'default'");
    }
    else
    {
      CLAnimations.gotoAndStop(1, element);
      //console.log("[ScreenUI.js::AttributeHandlerReticleTypeFrame] Set frame to 1");
    }
  }
}

engine.whenReady.then(() =>
{
  engine.registerBindingAttribute("reticle-sub-type-frame", AttributeHandlerReticleSubTypeFrame);
});

/////////////////////////////////////////////////////////////////////////////////
engine.on('SetReticleType', function (prev_primary_type, new_primary_type, prev_sub_type, new_sub_type)
{
  if (prev_primary_type == new_primary_type && prev_sub_type == new_sub_type)
  {
    return;
  }

  if (prev_primary_type < ReticlePrimaryType.kInvalidIndex || prev_primary_type >= ReticlePrimaryType.kItemCount)
  {
    console.warn("[ScreenUI.js::SetReticleType()] Parameter prev_primary_type = " + prev_primary_type + ", not in valid range: " + ReticlePrimaryType.kInvalidIndex + " to " + (ReticlePrimaryType.kItemCount - 1));
    return;
  }
  if (new_primary_type < ReticlePrimaryType.kInvalidIndex || new_primary_type >= ReticlePrimaryType.kItemCount)
  {
    console.warn("[ScreenUI.js::SetReticleType()] Parameter new_primary_type = " + new_primary_type + ", not in valid range: " + ReticlePrimaryType.kInvalidIndex + " to " + (ReticlePrimaryType.kItemCount - 1));
    return;
  }
  if (prev_sub_type < ReticleSubType.kInvalidIndex || prev_sub_type >= ReticleSubType.kItemCount)
  {
    console.warn("[ScreenUI.js::SetReticleType()] Parameter prev_sub_type = " + prev_sub_type + ", not in valid range: " + ReticleSubType.kInvalidIndex + " to " + (ReticleSubType.kItemCount - 1));
    return;
  }
  if (new_sub_type <= ReticleSubType.kInvalidIndex || new_sub_type >= ReticleSubType.kItemCount)
  {
    // New sub-type cannot be kInvalidIndex
    console.warn("[ScreenUI.js::SetReticleType()] Parameter new_sub_type = " + new_sub_type + ", not in valid range: " + ReticleSubType.kDefault + " to " + (ReticleSubType.kItemCount - 1));
    return;
  }

  let root_element = document.querySelector('.Root_ScreenUI_Reticle');
  let wrapper_element = GetWrapperElement(root_element);
  let element = wrapper_element ? wrapper_element.querySelector(".ret_wrapper") : undefined;
  if (!element)
  {
    console.warn("[ScreenUI.js::SetReticleType()] Unable to get valid reticle wrapper element");
    return;
  }

  let frameData = {
    frame_start: undefined,
    frame_end: undefined,
    callback_name: undefined
  };

  // Intro
  if (prev_primary_type == ReticlePrimaryType.kInvalidIndex)
  {
    // First try to get the primary-type intro
    let desired_frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[new_primary_type] + "_intro";
    let desired_frame_end = desired_frame_start + "_end";
    if (isFrameLabelValid(element, desired_frame_start))
    {
      frameData.frame_start = desired_frame_start;
      frameData.frame_end = desired_frame_end;
    }
    else
    {
      // Next try to get a sub-type intro
      desired_frame_start = RETICLE_SUB_TYPE_FRAME_LABELS[new_sub_type] + "_intro";
      desired_frame_end = desired_frame_start + "_end";
      if (isFrameLabelValid(element, desired_frame_start))
      {
        frameData.frame_start = desired_frame_start;
        frameData.frame_end = desired_frame_end;
      }
      else
      {
        // Fallback to a default intro (which has to exist)
        frameData.frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[ReticlePrimaryType.kDefault] + "_intro";
        frameData.frame_end = desired_frame_end;
      }
    }
  }
  // Outro
  if (new_primary_type == ReticlePrimaryType.kInvalidIndex)
  {
    // First try to get the primary-type outro
    let desired_frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[prev_primary_type] + "_outro";
    let desired_frame_end = desired_frame_start + "_end";
    if (isFrameLabelValid(element, desired_frame_start))
    {
      frameData.frame_start = desired_frame_start;
      frameData.frame_end = desired_frame_end;
    }
    else
    {
      prev_sub_type = prev_sub_type == ReticleSubType.kInvalidIndex ? ReticleSubType.kDefault : prev_sub_type;

      // Next try to get a sub-type outro
      desired_frame_start = RETICLE_SUB_TYPE_FRAME_LABELS[prev_sub_type] + "_outro";
      desired_frame_end = desired_frame_start + "_end";
      if (isFrameLabelValid(element, desired_frame_start))
      {
        frameData.frame_start = desired_frame_start;
        frameData.frame_end = desired_frame_end;
      }
      else
      {
        // Fallback to a default outro (which has to exist)
        frameData.frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[ReticlePrimaryType.kDefault] + "_outro";
        frameData.frame_end = desired_frame_end;
      }
    }
  }

  if (frameData.frame_start == undefined && frameData.frame_end == undefined)
  {
    // First, if primary type changed go from old to new
    if (prev_primary_type != new_primary_type)
    {
      let desired_frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[prev_primary_type] + "_to_" + RETICLE_PRIMARY_TYPE_FRAME_LABELS[new_primary_type];
      if (isFrameLabelValid(element, desired_frame_start))
      {
        frameData.frame_start = desired_frame_start;
        frameData.frame_end = desired_frame_start + "_end";
      }
      else
      {
        let desired_frame_end = RETICLE_PRIMARY_TYPE_FRAME_LABELS[new_primary_type] + "_intro_end";
        if (isFrameLabelValid(element, desired_frame_end))
        {
          frameData.frame_end = desired_frame_end;
        }
        else
        {
          frameData.frame_end = "default_intro_end";
        }
      }
    }
    else if (prev_sub_type != prev_sub_type)
    {
      let desired_frame_start = RETICLE_PRIMARY_TYPE_FRAME_LABELS[new_primary_type] + "_" + RETICLE_SUB_TYPE_FRAME_LABELS[prev_sub_type] + "_to_" + RETICLE_SUB_TYPE_FRAME_LABELS[new_sub_type];
      if (isFrameLabelValid(element, desired_frame_start))
      {
        frameData.frame_start = desired_frame_start;
        frameData.frame_end = desired_frame_start + "_end";
      }
      else
      {
        if (new_primary_type == ReticlePrimaryType.kDefault)
        {
          desired_frame_start = RETICLE_SUB_TYPE_FRAME_LABELS[prev_sub_type] + "_to_" + RETICLE_SUB_TYPE_FRAME_LABELS[new_sub_type];
          if (isFrameLabelValid(element, desired_frame_start))
          {
            frameData.frame_start = desired_frame_start;
            frameData.frame_end = desired_frame_start + "_end";
          }
          else
          {
            let desired_frame_end = RETICLE_SUB_TYPE_FRAME_LABELS[new_sub_type] + "_intro_end";
            if (isFrameLabelValid(element, desired_frame_end))
            {
              frameData.frame_end = desired_frame_end
            }
          }
        }
      }
    }
  }

  //console.log("[ScreenUI.js::SetReticleType()] prev_primary_type = " + prev_primary_type + ", new_primary_type = " + new_primary_type + ", prev_sub_type = " + prev_sub_type + ", new_sub_type = " + new_sub_type");
  //console.log("[ScreenUI.js::SetReticleType()] frame_start = " + frameData.frame_start + ", frame_end = " + frameData.frame_end + ", callback = " + frameData.callback_name);

  if (frameData.frame_start && frameData.frame_end)
  {
    CLAnimations.playFromTo(frameData.frame_start, frameData.frame_end, element, 
    {
      callback: function () 
      {
        if (frameData.callback_name)
        {
          engine.call(frameData.callback_name);
        }
      }
    });
  }
  else if (frameData.frame_end)
  {
    CLAnimations.gotoAndStop(frameData.frame_end, element);
    if (frameData.callback_name)
    {
      engine.call(frameData.callback_name);
    }
  }
  else if (prev_primary_type != new_primary_type)
  {
    // Only warn if the primary type is changing and no frame was set
    console.warn("[ScreenUI.js::SetReticleType()] Unable to play reticle animation: prev_type = " + prev_type + ", new_type = " + new_type);
  }
});