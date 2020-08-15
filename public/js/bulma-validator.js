/*!
 * jQuery plugin
 * What does it do
 */
(function ($) {
  $.fn.BulmaValidator = function (opts) {
    // default configuration
    var config = $.extend(
      {},
      {
        classes: {
          danger: 'is-danger',
          success: 'is-success',
          helptext: 'help',
        },
        fields: ['text', 'email', 'password'],
        settings: {
          text: {
            regex: '^[A-Za-z0-9-]{4,100}$',
            errMsg: {
              min: 'Minimum chars: 4',
              blank: "Can't be blank",
            },
          },
          email: {
            regex:
              '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$',
          },
          password: {
            regex: "^[A-Za-z ,.'-]{6,35}$",
            errMsg: {
              min: 'Minimum chars: 6',
              blank: "Can't be blank",
            },
          },
        },
      },
      opts
    );

    // main function
    function Validate($e) {
      // console.log($e.attr('type'));
      var fieldtype = $e.attr('type');
      var regex = new RegExp(config.settings[fieldtype].regex);

      if (regex.test($e.val())) {
        $e.removeClass(config.classes.danger)
          .addClass(config.classes.success)
          .data('validation-error', 'false')
          .parent()
          .siblings('.' + config.classes.helptext)
          .hide();

        RemoveIcon($e);
        AddIcon($e, 'valid');
      } else {
        $e.removeClass(config.classes.success)
          .addClass(config.classes.danger)
          .data('validation-error', 'true')
          .parent()
          .siblings('.' + config.classes.helptext)
          .show();

        RemoveIcon($e);
        RemoveHelpText($e);
        AddIcon($e, 'not-valid');
        AddHelpText($e, fieldtype);
      }
    }

    const AddHelpText = (e, fieldType) => {
      const field = e.parent().parent();

      let errMsg = '';

      if (e.val().length == 0) {
        errMsg = config.settings[fieldType].errMsg.blank;
      } else if (e.val().length < 5) {
        errMsg = config.settings[fieldType].errMsg.min;
      }

      if (field.children().length == 1) {
        let html = `<p class="help is-danger">${errMsg}</p>`;
        field.append(html);
      } else {
        field.children()[1].text = errMsg;
      }
    };

    function RemoveHelpText(e) {
      const field = e.parent().parent();
      field.children().siblings('p').remove();
    }

    function ValidateAll($form) {
      $form.find('input').each(function (index, element) {
        var $element = $(element);
        if ($.inArray($element.attr('type'), config.fields) !== -1) {
          Validate($(element));
        }
      });
    }

    function RegisterValidator(e) {
      e.keyup(function () {
        Validate(e);
      });
    }

    function AddIcon(e, type) {
      if (type == 'valid') {
        var html =
          '<span class="icon is-small is-right"><i class="fas fa-check has-text-success"></i></span>';
      } else if (type == 'not-valid') {
        var html =
          '<span class="icon is-small is-right"><i class="fas fa-exclamation-triangle has-text-danger"></i></span>';
      }

      if (e.parent().hasClass('has-icons-right')) {
        e.parent().append(html);
      }
    }

    function RemoveIcon(e) {
      e.siblings('.is-right').remove();
    }

    // initialize every element
    this.find('input').each(function () {
      RegisterValidator($(this));
    });

    var $form = this;

    $form.find('[type=submit]').click(function (button) {
      // button.preventDefault();
      ValidateAll($form);
    });

    

    return this;
  };
  // @ts-ignore
})(jQuery);
