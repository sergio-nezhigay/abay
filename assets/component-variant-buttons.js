const productVariants = {{ product.variants | json }};
const optionNames = {{ product.options | json }};
const selectedOptions = {};

$(document).ready(function () {
  // Option button click
  $(document).on('click', '#product-variant-buttons .option-button', function () {
    const optionName = $(this).data('option-name');
    const value = $(this).data('value');

    // Store selected value
    selectedOptions[optionName] = value;

    // UI update
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');

    // Find matching variant
    const matchingVariant = productVariants.find(variant => {
      return variant.options.every((optValue, index) => {
        const optName = optionNames[index];
        return selectedOptions[optName] === optValue;
      });
    });

    // Update hidden input and image
    if (matchingVariant) {
      $('#variant-id').val(matchingVariant.id);
      if (matchingVariant.featured_image) {
        const imgUrl = matchingVariant.featured_image.src.replace(/(\.[^/.]+)$/, '_800x$1');
        $('#variant-image').attr('src', imgUrl);
      }
    }
  });
});