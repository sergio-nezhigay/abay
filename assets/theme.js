$(document).ready(function () {
  // Open Side Bar
  $(document).on('click', '.open-categories', function () {
    $('#categories-sidebar').addClass('open');
    $('#sidebar-overlay').addClass('show');

    let thisActive = $(this).attr('data-value');
    let thisURL = $(this).attr('data-url');
    $('#categories-sidebar').find('button.sc_btn').removeClass('clicked');
    $('#categories-sidebar')
      .find('.sidebar__value .sv_wrapper')
      .removeClass('clicked');
    $('#categories-sidebar')
      .find('button.sc_btn')
      .each(function () {
        if ($(this).attr('data-content') == thisActive) {
          $(this).addClass('clicked');
          $('#categories-sidebar')
            .find(
              ".sidebar__value .sv_wrapper[data-content='" + thisActive + "']"
            )
            .addClass('clicked');
          $('#categories-sidebar .sidebar-all-link').attr('href', thisURL);
        }
      });
  });

  // Close Side Bar
  $(document).on('click', '#close-categories, #sidebar-overlay', function () {
    $('#categories-sidebar').removeClass('open');
    $('#sidebar-overlay').removeClass('show');
  });

  // Viewing Sub Categories
  $(document).on('click', 'button.sc_btn', function () {
    $('#categories-sidebar').find('button.sc_btn').removeClass('clicked');
    $('#categories-sidebar')
      .find('.sidebar__value .sv_wrapper')
      .removeClass('clicked');
    $(this).addClass('clicked');
    let thisActive = $(this).attr('data-content');
    let thisURL = $(this).attr('data-url');
    $('#categories-sidebar')
      .find(".sidebar__value .sv_wrapper[data-content='" + thisActive + "']")
      .addClass('clicked');
    $('#categories-sidebar .sidebar-all-link').attr('href', thisURL);
  });

  // Openning Footer quicklinks
  $(document).on('click', '.mb-quick-title', function () {
    let linkValues = $(this).siblings('.mb-quick-value').hasClass('active');

    if (linkValues) {
      $(this).siblings('.mb-quick-value').removeClass('active');
    } else {
      $('.mb-quick-value').removeClass('active');
      $(this).siblings('.mb-quick-value').addClass('active');
    }
  });
});

// FREE SHIPPING BAR
const country_user = () => {
  return $.ajax({
    url: '/browsing_context_suggestions.json',
    method: 'GET',
    dataType: 'json', // tells jQuery to parse JSON for you
    cache: false,
    headers: { Accept: 'application/json' },
  });
};

const bar_update = () => {
  let meterDiv = $(document).find('#FreeShippingFill');
  let threshold = 750; // SHIPPING MIN AMOUNT FOR FREE DELIVERY
  let freeCountryList = ['BH', 'KW', 'OM', 'QA', 'SA', 'AE'];
  let chkCountry;
  country_user().done((code_cty) => {
    chkCountry = code_cty.detected_values.country.handle;
    // IF USER IN GCC FREE SHIPPING IS OFFERED
    if ($.inArray(chkCountry, freeCountryList) > -1) {
      meterDiv.css('width', '100%');
      $(document)
        .find('#FreeShippingText')
        .html('🎉 Congratulations! You have Free Shipping!');
    } else {
      fetchCart().then((cart) => {
        let subtotal = cart.total_price / 100.0;
        let percent = Math.min(100.0, (subtotal / threshold) * 100.0);
        let remaining = threshold - subtotal;
        if (remaining > 0) {
          meterDiv.css('width', `${percent}%`);
          $(document)
            .find('#FreeShippingText')
            .html(
              `Only <span class="glc-money">${remaining}</span> away from Free Shipping!`
            );
        } else {
          meterDiv.css('width', '100%');
          $(document)
            .find('#FreeShippingText')
            .html('🎉 Congratulations! You have Free Shipping!');
        }
      });
    }
  });
};

// NEW CART JS
function refreshCartStockJson() {
  // Use the current page path so it works on any page
  var url = window.location.pathname + '?section_id=cart-stock-json';

  return $.ajax({ url: url, method: 'GET', dataType: 'html' }).then(function (
    html
  ) {
    var $html = $('<div>').html(html);
    var $newScript = $html.find('#inv-json-data');

    if ($newScript.length) {
      $('#inv-json-data').replaceWith($newScript);
      try {
        return JSON.parse($newScript.text());
      } catch (e) {
        return {};
      }
    }
    return {};
  });
}

async function fetchCart() {
  const res = await fetch('/cart.js', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

const getCartStockMap = () => {
  var $el = $('script#inv-json-data[data-cart-stock]');
  if (!$el.length) return {};
  try {
    return JSON.parse($.trim($el.text()));
  } catch (e) {
    console.error('Invalid cart stock JSON:', e, '\nRAW:', $el.text());
    return {};
  }
};

const plotHtml = (datas) => {
  let cartItems = datas.items;
  if (cartItems.length == 0) {
    cartEmptyHtml();
    return false;
  }

  $(document).find('#ctm-cart-parent .ctm-cart-empty').addClass('hidden');
  $(document).find('.ctm-cart-body').removeClass('hidden');
  $(document).find('.ctm-cart-footer').removeClass('hidden');

  let cartTotal = (datas.total_price / 100).toFixed(2);
  let cartItems_html = '';
  for (let index = 0; index < cartItems.length; index++) {
    let rowitems = cartItems[index];
    let rowFinAmount = (rowitems.final_line_price / 100).toFixed(2);
    let rowAmount = (rowitems.original_price / 100).toFixed(2);
    let rowDiscountAmount = (rowitems.discounted_price / 100).toFixed(2);
    cartItems_html += `<div class="ctm-cart-item" data-line-key="${rowitems.key}" data-variantid="${rowitems.variant_id}" data-line-handle="${rowitems.handle}">`;
    cartItems_html += '<div class="cart-imgs">';
    cartItems_html += `<img src="${rowitems.image}">`;
    cartItems_html += '</div>';
    cartItems_html += '<div class="cart-desc">';

    cartItems_html += `<div class="__prd_name">${rowitems.product_title}</div>`;

    cartItems_html += `<div class="__prd_opt">`;
    for (let opt = 0; opt < rowitems.options_with_values.length; opt++) {
      let optData = rowitems.options_with_values[opt];
      cartItems_html += `<div class="__opt_items">`;
      cartItems_html += `<span>${optData.name}: </span>`;
      cartItems_html += `<span style="margin-left: 1rem;">${optData.value}</span>`;
      cartItems_html += `</div>`;
    }
    cartItems_html += `</div>`;
    // cartItems_html += `<div class="__prd_discount">&nbsp;</div>`
    cartItems_html += `<div class="__prd_money">`;
    if (rowAmount !== rowDiscountAmount) {
      cartItems_html += `<span class="old money">${rowAmount}</span>`;
    }
    cartItems_html += `<span class="new glc-money">Dhs. ${rowDiscountAmount}</span>`;

    cartItems_html += `</div>`;

    cartItems_html += `<div class="__prd_fin_money"><span class="glc-money">Dhs. ${rowFinAmount}</span></div>`;

    cartItems_html += `<div class="__prd_cart_menu">`;
    cartItems_html += `<div class="__prd_qty">`;
    cartItems_html += `<button type="button" class="__prd_mins"><span class="svg-wrapper"><svg xmlns="http://www.w3.org/2000/svg" fill="none" class="icon icon-minus" viewBox="0 0 10 2"><path fill="currentColor" fill-rule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 1 1 0 1H1A.5.5 0 0 1 .5 1" clip-rule="evenodd"></path></svg></span></button>`;
    cartItems_html += `<input type="text" value="${rowitems.quantity}" readonly>`;
    cartItems_html += `<button type="button" class="__prd_plus"><span class="svg-wrapper"><svg xmlns="http://www.w3.org/2000/svg" fill="none" class="icon icon-plus" viewBox="0 0 10 10"><path fill="currentColor" fill-rule="evenodd" d="M1 4.51a.5.5 0 0 0 0 1h3.5l.01 3.5a.5.5 0 0 0 1-.01V5.5l3.5-.01a.5.5 0 0 0-.01-1H5.5L5.49.99a.5.5 0 0 0-1 .01v3.5l-3.5.01z" clip-rule="evenodd"></path></svg></span></button>`;
    cartItems_html += `</div>`;
    cartItems_html += `<button type="button" class="__prd_remove"><span class="svg-wrapper"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-remove" viewBox="0 0 16 16"><path fill="currentColor" d="M14 3h-3.53a3.07 3.07 0 0 0-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 0 0 5.53 3H2a.5.5 0 0 0 0 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 0 0 .5-.5V4H14a.5.5 0 0 0 0-1M6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02m4.84 11.52h-7.5V4h7.5z"></path><path fill="currentColor" d="M6.55 5.25a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5m2.9 0a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-.5-.5"></path></svg></span></button>`;
    cartItems_html += `</div>`;

    cartItems_html += '<div class="__prd_error"></div>';

    cartItems_html += `</div>`;
    cartItems_html += `</div>`;
  }
  $(document)
    .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-body .ctm-cartItems')
    .html(cartItems_html);
  $(document)
    .find(
      '#ctm-cart-parent .ctm-cart-content .ctm-cart-footer .__cartMoney-money'
    )
    .html(`<span class="glc-money">${cartTotal}</span>`);

  // RUN SHIPPING BAR
  bar_update();
  refreshCartStockJson().then(function (invMap) {
    // invMap now has the fresh per-variant inventory data
    // console.log(invMap);
    freeGiftCampaign();
    $(document)
      .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-loader')
      .toggleClass('active');
  });
};

const cart_update_qty = (lineKey, count) => {
  if (
    !$(document)
      .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-loader')
      .hasClass('active')
  ) {
    $(document)
      .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-loader')
      .toggleClass('active');
  }
  $.ajax({
    url: '/cart/change.js',
    method: 'POST',
    dataType: 'json',
    data: JSON.stringify({ id: lineKey, quantity: count }),
    contentType: 'application/json',
    success: function (e) {
      let totalCartCount = e.item_count;
      $(document)
        .find('.ctm-cart-bubble')
        .find('span:eq(0)')
        .text(totalCartCount);
      $(document)
        .find('.ctm-cart-bubble')
        .find('span:eq(1)')
        .text(totalCartCount + ' items');
      cart_update_html();
    },
  });
};

const cart_inventory_allowed = (varid, count) => {
  let invMap = getCartStockMap();
  invMap = invMap[varid];
  let sellMax = false;

  if (count > invMap.qty) {
    if (invMap.policy !== 'continue') {
      sellMax = false;
    } else {
      sellMax = true;
    }
  } else {
    sellMax = true;
  }

  return sellMax;
};

const cart_update_html = () => {
  let parentElm = $(document).find('#ctm-cart-parent');
  parentElm.find('.ctm-cartItems').css('opacity', 0);
  if (
    !$(document)
      .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-loader')
      .hasClass('active')
  ) {
    $(document)
      .find('#ctm-cart-parent .ctm-cart-content .ctm-cart-loader')
      .toggleClass('active');
  }
  setTimeout(() => {
    fetchCart()
      .then((cart) => {
        plotHtml(cart);
      })
      .then(() => {
        parentElm.find('.ctm-cartItems').css('opacity', 1);
      });
  }, 500);
};

// FREE GIFTS CAMPAIGN
function fetchProductByHandle(handle) {
  return $.ajax({
    url: '/products/' + encodeURIComponent(handle) + '.js',
    method: 'GET',
    dataType: 'json',
    cache: false,
    headers: { Accept: 'application/json' },
  });
}

const freeGiftCampaign = () => {
  let prdHandle = 'hidden-gem-1';
  // let prdHandle = 'butterfly-effect-digital-print-design-oversized-t-shirt';
  let gem = [];
  $(document)
    .find('.ctm-cart-item')
    .each(function () {
      let lines = $(this).attr('data-line-handle');
      if (lines.indexOf(prdHandle) == 0) {
        gem.push(lines);
      }
    });
  console.log(gem.length);
  if (gem.length > 0) {
    $(document).find('.ctm-freeGiftsForm').addClass('hide');
    setTimeout(function () {
      $(document).find('.ctm-freeGiftsForm').removeClass('hide');
      $(document).find('.ctm-freeGiftsForm').addClass('hidden');
    }, 250);
  } else {
    if ($(document).find('.ctm-freeGiftsForm').hasClass('hide')) {
      $(document).find('.ctm-freeGiftsForm').removeClass('hide');
    }
    if ($(document).find('.ctm-freeGiftsForm').hasClass('hidden')) {
      $(document).find('.ctm-freeGiftsForm').removeClass('hidden');
    }
    let gfHtml = '';
    let gfOpts = '';
    fetchProductByHandle(prdHandle).done((prd) => {
      console.log(prd);
      // PRD IMG
      $(document)
        .find('.ctm-freeGiftsForm .gf-imgs img')
        .attr('src', prd.featured_image);
      // PRD TITLE
      $(document)
        .find('.ctm-freeGiftsForm .gf-title')
        .html(`<a href="${prd.url}" title="${prd.title}">${prd.title}</a>`);
      // LOOP THROUGH OPTIONS
      let prdOpts = prd.options;
      prdOpts.forEach((optData) => {
        gfOpts += `<div class="gf-opts-item">`;
        gfOpts += `<div class="opts-title">`;
        gfOpts += `<span>${optData.name}</span>`;
        gfOpts += `</div>`;
        gfOpts += `<div class="opts-value">`;
        gfOpts += `<select class="gf-opts-data">`;
        optData.values.forEach((optVal) => {
          gfOpts += `<option value="${optVal}">${optVal}</option>`;
        });
        gfOpts += `</select>`;
        gfOpts += `</div>`;
        gfOpts += `</div>`;
      });
      $(document).find('#gf-var-id').val(prd.variants[0].id);
      $(document).find('.ctm-freeGiftsForm .gf-opts').html(gfOpts);
    });
  }
};

const addToCart = (
  variantId,
  qty = 1,
  ppt = null,
  sellingPlanId = null,
  sections = []
) => {
  const payload = { id: variantId, quantity: qty };
  if (ppt && typeof ppt === 'object') payload.properties = ppt;
  if (sellingPlanId) payload.selling_plan = sellingPlanId;

  return $.ajax({
    url: '/cart/add.js',
    method: 'POST',
    dataType: 'json',
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify(payload),
  }).done(() => {
    cart_update_html();
  });
};

const cartEmptyHtml = () => {
  let elm = $(document).find('#ctm-cart-parent');
  elm.find('.ctm-cart-body').addClass('hidden');
  elm.find('.ctm-cart-footer').addClass('hidden');
  elm.find('.ctm-cart-loader').toggleClass('active');
  elm.find('.ctm-cart-empty').removeClass('hidden');
};

function goToCheckout() {
  // Prefer submitting the cart form if present:
  const form = document.querySelector('form[action="/cart"]');
  window.location.href = '/checkout';
}

$(document).ready(function () {
  // OPEN CART
  $(document).on('click', '.ctm-cart-btn', function () {
    $('#ctm-cart-parent').removeClass('cart-hidden');
    setTimeout(function () {
      $('#ctm-cart-wrapper').attr('aria-hidden', false);
      cart_update_html();
    }, 250);
  });

  // CLOSE CART
  $(document).on('click', '#ctm-cart-parent', function (e) {
    if (
      $(e.target).closest('#ctm-cart-wrapper').length === 0 ||
      $(e.target).closest('.__close').length === 1
    ) {
      $('#ctm-cart-wrapper').attr('aria-hidden', true);
      setTimeout(function () {
        $('#ctm-cart-parent').toggleClass('cart-hidden');
      }, 250);
    }
  });

  // MINUS QTY
  $(document).on('click', '.__prd_mins', function () {
    let rowqty = $(this).parents('.__prd_qty').find("input[type='text']").val();
    let rowkey = $(this).parents('.ctm-cart-item').attr('data-line-key');
    let rowvar = $(this).parents('.ctm-cart-item').attr('data-variantid');
    let elm = $(this).parents('.ctm-cart-item');
    let sellMax = cart_inventory_allowed(rowvar, parseInt(rowqty) - 1);
    if (parseInt(rowqty) - 1 > 0) {
      if (sellMax) {
        cart_update_qty(rowkey, parseInt(rowqty) - 1);
      } else {
        $(this)
          .parents('.ctm-cart-item')
          .find('.__prd_error')
          .text('Only 1 item was added to your cart due to availability.');
      }
    } else {
      $(this).parents('.ctm-cart-item').find('.__prd_remove').click();
    }
  });

  // ADD QTY
  $(document).on('click', '.__prd_plus', function () {
    let rowqty = $(this).parents('.__prd_qty').find("input[type='text']").val();
    let rowkey = $(this).parents('.ctm-cart-item').attr('data-line-key');
    let rowvar = $(this).parents('.ctm-cart-item').attr('data-variantid');
    let elm = $(this).parents('.ctm-cart-item');
    let sellMax = cart_inventory_allowed(rowvar, parseInt(rowqty) + 1);
    if (sellMax) {
      cart_update_qty(rowkey, parseInt(rowqty) + 1);
    } else {
      $(this)
        .parents('.ctm-cart-item')
        .find('.__prd_error')
        .text('Only 1 item was added to your cart due to availability.');
    }
  });

  // REMOVE
  $(document).on('click', '.__prd_remove', function () {
    let rowqty = $(this).parents('.__prd_qty').find("input[type='text']").val();
    let rowkey = $(this).parents('.ctm-cart-item').attr('data-line-key');
    let elm = $(this).parents('.ctm-cart-item');
    cart_update_qty(rowkey, 0);
  });

  // CHANGE GIFT VARIANTS
  $(document).on('change', '.gf-opts-data', function () {
    let gfVariant = '';
    let prdHandle = 'hidden-gem-1';
    $(document)
      .find('.gf-opts-data')
      .each(function () {
        if (gfVariant !== '') {
          gfVariant += ' / ' + $(this).val();
        } else {
          gfVariant += $(this).val();
        }
      });

    fetchProductByHandle(prdHandle).done((prd) => {
      let gfVariants = prd.variants;
      gfVariants.forEach((data) => {
        if (data.title == gfVariant) {
          $(document).find('#gf-var-id').val(data.id);
          $(document)
            .find('.ctm-freeGiftsForm .gf-imgs img')
            .attr('src', data.featured_image.src);
          return false;
        }
      });
    });
  });

  // SUBMIT FREE GIFTS
  $(document).on('click', '.gf-submit button', function () {
    let variantId = $(document).find('#gf-var-id').val();
    let qty = 1;
    addToCart(variantId, qty, false, false, false);
  });

  // PROCEED TO CHECKOUT
  $(document).on('click', '.ctm-cartCheckout button', function () {
    let isFreeAdded = false;
    let prdHandle = 'hidden-gem-1';
    $(document)
      .find('.ctm-cart-item')
      .each(function () {
        if ($(this).attr('data-line-handle') == prdHandle) {
          isFreeAdded = true;
          return false;
        }
      });

    if (isFreeAdded) {
      if ($(document).find('#cap-reminder-message').hasClass('active')) {
        $(document)
          .find('#cap-reminder-message')
          .fadeOut('fast', function () {
            $(this).removeClass('active');
          });
      }

      goToCheckout();
    } else {
      $(document)
        .find('#cap-reminder-message')
        .fadeIn('fast', function () {
          $(this).addClass('active');
        });
    }
  });

  // CLOSE CAP MESSAGE
  $(document).on('click', '#rmd-close', function () {
    $(document)
      .find('#cap-reminder-message')
      .fadeOut('fast', function () {
        $(this).removeClass('active');
      });
  });

  // CONTINUE TO CHECKOUT
  $(document).on('click', '#rmd-continue', function () {
    goToCheckout();
  });

  // PREVENT BEING REDIRECTED TO CART PAGE
  $(document).on('click', "[name='add']", function (e) {
    setTimeout(function () {
      $(document).find('.ctm-cart-btn').click();
    }, 1000);
  });
});

// ADD TO CART SHORTCUT
function addToCart_ShortCut(variantId, qty = 1) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(variantId), quantity: qty }),
  })
    .then((r) => r.json())
    .then((data) => {
      console.log('Added to cart:', data);
      // TODO: open your cart drawer here
      $(document).find('.ctm-cart-btn').click();
    })
    .catch((err) => console.error('ATC error:', err));
}

function getSelectedVariantIdFromCard(cardEl) {
  if (!cardEl) return null;

  // look within this product’s swatch container
  const swatchWrap = cardEl.querySelector('.custom-swatch-container');

  // 1) active swatch with a direct data-variant-id
  const active =
    swatchWrap && swatchWrap.querySelector('.custom-swatch-item.active');
  if (active && active.dataset.variantId) return active.dataset.variantId;

  // 2) parse from ?variant=... if only data-variant-url exists
  if (active && active.dataset.variantUrl) {
    try {
      const u = new URL(active.dataset.variantUrl, window.location.origin);
      const vid = u.searchParams.get('variant');
      if (vid) return vid;
    } catch (e) {}
  }

  // 3) fallback: default variant id (covers products without swatches)
  if (swatchWrap && swatchWrap.dataset.defaultVariantId)
    return swatchWrap.dataset.defaultVariantId;

  // ultimate fallback: first hidden input[name="id"] if you ever render a form
  const formInput = cardEl.querySelector('input[name="id"]');
  if (formInput && formInput.value) return formInput.value;

  return null;
}

// ADD TO CART SHORTCUT (desktop + mobile)
document.body.addEventListener('click', function (e) {
  const btn = e.target.closest('#qab-btn-dt, #qab-btn-mb, .card-quick-add');
  if (!btn) return;

  // find the card root
  const card = btn.closest('.custom-card-wrapper');
  if (!card) return;

  const variantId = getSelectedVariantIdFromCard(card);
  if (!variantId) {
    console.warn('No variant id found for this card.');
    return;
  }

  addToCart_ShortCut(variantId, 1);
});

// SHOW CUSTOM SIZE
const showCustomSize = () => {
  let varBtn = $("input.variantBtn[type='radio']:checked");
  if (varBtn.val() == 'Custom Size') {
    $('#custom-size-fields').fadeIn('fast');
  } else {
    $('#custom-size-fields').fadeOut('fast');
  }
};
$(document).ready(function () {
  showCustomSize();
  $(document).on('change', 'input.variantBtn[type="radio"]', function () {
    showCustomSize();
  });
});
