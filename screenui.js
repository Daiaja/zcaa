/////////////////////////////////////////////////////////////////////////////////
function getElementByClassName(className) 
{
  let element;
  switch (className) 
  {
    case "ScreenUIElementPauseCursor":
      element = document.querySelector('.Root_PauseMenu_Cursor');
      break;
    case "ScreenUIElementReticle":
      element = document.querySelector('.Root_ScreenUI_Reticle');
          break;
    case "ScreenUIElementAccessibility":
        element = document.querySelector('.Root_ScreenUI_Accessibility');
        break;
    case "ScreenUIElementMessages":
      element = document.querySelector('.Root_ScreenUI_Messages');
      break;
    case "ScreenUIElementImage":
      element = document.querySelector('.Root_ScreenUI_Image');
      break;
    case "ScreenUIElementTechBoxControls":
      element = document.querySelector('.Root_ScreenUI_TechBoxControls');
      break;
    case "ScreenUIElementEnemyHealthBars":
      element = document.querySelector('.Root_ScreenUI_EnemyHealthBars');
      break;
    case "ScreenUIElementTextMessages":
      element = document.querySelector('.Root_ScreenUI_TextMessages');
          break;
  }
	
  return element;
}

/////////////////////////////////////////////////////////////////////////////////
function ScreenUIResize()
{
  let elem = getElementByClassName('ScreenUIElementAccessibility');
  var styles = getComputedStyle(elem);
  const scale = getWindowStageScale();

  // center parent
  elem.parentElement.style.left = "50%";
  
  // center elem inside parent
  var elemWidth = parseInt(styles.getPropertyValue('width')) * scale;
  elem.style.left = (-elemWidth / 2) + 'px';
  
  // move at the bottom edge of the screen
  var elemHeight = parseInt(styles.getPropertyValue('height')) * scale;
  var winHeight = parseInt(window.innerHeight);
  elem.parentElement.style.top = (winHeight - elemHeight - 25) + 'px';

  elem.style.transform = `scale3d(${scale}, ${scale}, 1.0)`;
  
  resize();
}

window.addEventListener('load', ScreenUIResize);
window.addEventListener('resize', ScreenUIResize);

/////////////////////////////////////////////////////////////////////////////////
// Show/Hide Elements with wrapper support
/////////////////////////////////////////////////////////////////////////////////

const HeroType =
{
  kNone: 0,
  kGeneric: 1,
  kSpiderManPete: 2,
  kSpiderManMiles: 3,
  kSpiderManSymbiote: 4,
  kSpiderManVenom: 5,
  kItemCount: 6
}

var HERO_TYPE_WRAPPER_CLIPS = 
[
  "<invalid>",
  "wrapper_generic",
  "wrapper_sm_pete",
  "wrapper_sm_miles",
  "wrapper_sm_symbiote",
  "wrapper_venom",
];

var CURRENT_HERO_TYPE = HeroType.kSpiderManPete;

/////////////////////////////////////////////////////////////////////////////////
engine.on('SetHeroType', async function (hud_hero_type)
{
  CURRENT_HERO_TYPE = hud_hero_type;
  if (CURRENT_HERO_TYPE >= HeroType.kItemCount)
  {
    // Default new HUDs to SM Pete until we add new wrappers
    CURRENT_HERO_TYPE = HeroType.kSpiderManPete;
  }
  console.log("[ScreenUI.js::SetHeroType()] Hero Type set to " + CURRENT_HERO_TYPE);
});

/////////////////////////////////////////////////////////////////////////////////
engine.on('SetAllElementVisibility', function (visible)
{
  let scene_elem = document.querySelector("._prysmScene");

  for (let i = 0; i < scene_elem.children.length; i++)
  {
    scene_elem.children[i].style.opacity = visible ? 1 : 0;
  }
});

/////////////////////////////////////////////////////////////////////////////////
function GetWrapperElement(root_element)
{
  let wrapper_element = undefined;
  if (CURRENT_HERO_TYPE >= 0 && CURRENT_HERO_TYPE < HeroType.kItemCount)
  {
    wrapper_element = root_element ? root_element.querySelector("." + HERO_TYPE_WRAPPER_CLIPS[CURRENT_HERO_TYPE]) : undefined;
    if (!wrapper_element)
    {
      wrapper_element = root_element ? root_element.querySelector("." + HERO_TYPE_WRAPPER_CLIPS[HeroType.kSpiderManPete]) : undefined;
    }
  }
  return wrapper_element ? wrapper_element : root_element;
}

/////////////////////////////////////////////////////////////////////////////////
function ShowUIElement(element, instant, callbackName = undefined)
{
  if (!element) 
  {
    console.warn("[ScreenUI.js::ShowUIElement] Invalid element");
    return;
  }

  let wrapper_element = GetWrapperElement(element);
  Base_ShowUIElement(wrapper_element, instant, callbackName);
}

/////////////////////////////////////////////////////////////////////////////////
function HideUIElement(element, instant, callbackName = undefined)
{
  if (!element)
  {
    console.warn("[ScreenUI.js::HideUIElement()] Invalid elem object");
    return;
  }

  let wrapper_element = GetWrapperElement(element);
  Base_HideUIElement(wrapper_element, instant, callbackName);
}



/////////////////////////////////////////////////////////////////////////////////
function OnTechBoxBG9SliceComplete(nine_slice_obj)
{
  if (!nine_slice_obj) 
  {
    console.warn("[ScreenUI.js::OnTechBoxBG9SliceComplete] Invalid 9-Slice object parameter");
    return;
  }
  if (!nine_slice_obj.bgElement) 
  {
    console.warn("[ScreenUI.js::OnTechBoxBG9SliceComplete] 9-Slice object bgElement is invalid!");
    return;
  }
  if (!nine_slice_obj.completedSuccessfully) 
  {
    console.warn("[ScreenUI.js::OnTechBoxBG9SliceComplete] 9-Slice objective BG not completed successfully");
    return;
  }

  let tbc_element = nine_slice_obj.bgElement.parentElement.parentElement;

  let bracket_offset_stage = 20;
  if (tbc_element.getAttribute('class').indexOf('miles') >= 0)
  {
    bracket_offset_stage = 4;
  }
  let bracket_offset = (nine_slice_obj.bgFinalWidth / 2) + StageToViewPixels(bracket_offset_stage);

  let bracket_left = tbc_element.querySelector(".bracket_left");
  if (bracket_left)
  {
    bracket_left.style.transformOrigin = "top left";
    bracket_left.style.transform = "translate(" + (-bracket_offset) + "px,0px)";
  }
  let bracket_right = tbc_element.querySelector(".bracket_right");
  if (bracket_right)
  {
    bracket_right.style.transformOrigin = "center";
    bracket_right.style.transform = "translate(" + bracket_offset + "px,0px) scale(-1,1)";
  }
}

/////////////////////////////////////////////////////////////////////////////////
function OnTextMessageArt9SliceComplete(nine_slice_obj)
{
  if (!nine_slice_obj) 
  {
    console.warn("[ScreenUI.js::OnTextMessageArt9SliceComplete] Invalid 9-Slice object parameter");
    return;
  }
  if (!nine_slice_obj.bgElement) 
  {
    console.warn("[ScreenUI.js::OnTextMessageArt9SliceComplete] 9-Slice object bgElement is invalid!");
    return;
  }
  if (!nine_slice_obj.completedSuccessfully) 
  {
    console.warn("[ScreenUI.js::OnTextMessageArt9SliceComplete] 9-Slice objective BG not completed successfully");
    return;
  }

  // TODO: Is there a better way to query the index??  This seems kinda crazy and could easily break with layout changes in Animate
  const container_item = nine_slice_obj.bgElement.parentElement.parentElement.parentElement;
  const text_message_index = container_item.text_message_index;
  let element_height = nine_slice_obj.bgFinalHeight;

  console.log("[ScreenUI.js::OnTextMessageArt9SliceComplete] 9-Slice objective BG completed successfully for text message index " + text_message_index);

  engine.call('OnTextMessageNineSliceComplete', text_message_index, element_height);

  let text_message_image = nine_slice_obj.bgElement.parentElement.querySelector(".mc_text_message_image");
  if (text_message_image)
  {
    text_message_image.style.transform = "translate(0px," + (element_height) + "px)";
  }
  else
  {
    console.warn("[ScreenUI.js::OnTextMessageArt9SliceComplete] Cannot find 'mc_text_message_image'!");
  }
}


/////////////////////////////////////////////////////////////////////////////////
// data-bind-text-message
/////////////////////////////////////////////////////////////////////////////////
class AttributeHandlerScreenUITextMessage
{  
  init(element, value) 
  {
    element.text_message_index = -1;
  }
  deinit(element) {}

  update(element, value) 
  {
    element.text_message_index = value.index;
    //console.log("AttributeHandlerScreenUITextMessage " + element.text_message_index);
    //console.log("AttributeHandlerScreenUITextMessage " + element.getAttribute('class'));
  }
}
engine.registerBindingAttribute("screenui-text-message", AttributeHandlerScreenUITextMessage);