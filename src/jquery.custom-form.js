/**  
 * jQuery Plugin: Custom Form Integration
 *   
 *  @package    JS Plugins
 *  @category   jquery plugin
 *  @name       jquery.custom-form.js
 *  @author     Rafael F. Silva <rafaelsilva@phocus.com.br>
 *  @link       /js/plugins/jquery.custom-form.js
 *  @since      14/01/2014
 *
 *  Este plugin necessita de outros plugins para certas funcionalidades funcionarem,
 *  como: select customizado (select2), máscara (maskedinput) e monetização (maskMoney).
 *
 */

(function($) {
	'use strict';

	$.fn.customForm = function(options) {
		var settings = $.extend({
			requiredClass: 'required',
			errorClass: 'error',
			errorContainer: '.messages'
		}, options);

		return this.each(function() {
			// Máscaras
			// Plugin requerido: maskedinput
			if( $.fn.mask ) {
				$(this).find('.field.date input').mask('99/99/9999');
				$(this).find('.field.time input').mask('99:99:99');
				$(this).find('.field.phone input').mask('99 99999999?9');
				$(this).find('.field.cpf input').mask('999.999.999-99');
				$(this).find('.field.cnpj input').mask('99.999.999/9999-99');
				$(this).find('.field.cep input').mask('99999-999');
				$(this).find('.field.carPlate input').mask('aaa-9999');
			}

			// Monetização
			// Plugin requerido: maskMoney
			if( $.fn.maskMoney ) {
				var defaults = {
					symbol: 'R$',
					showSymbol: true,
					symbolStay: true,
					thousands: '.',
					decimal: ',',
					precision: 2,
					defaultZero: true,
					allowZero: false,
					allowNegative: false
				};

				$(this).find('.field.money input').each(function() {
					var options = $.extend( defaults, $(this).data('options') || {} );

					$(this).maskMoney( options );
				});
			}

			// Select customizado
			// Plugin requerido: select2
			if( $.fn.select2 ) {
				// Sem campo de busca
				$(this).find('.field select.select2-no-search').each(function() {
					var options = $(this).data('options') || {};

					$.extend( options, { minimumResultsForSearch: -1 } );

					$(this).data('options', options);
				});

				// Procura por todos os selects com a classe começando em "select2"
				$(this).find('.field select[class*="select2"]').each(function() {
					var thisOptions = $(this).data('options') || {};

					var options = $.extend({
						placeholder: true,
						containerCssClass: 'select2-custom',
						dropdownCssClass: 'select2-custom'
					}, thisOptions );

					$(this).select2( options );
				});
			}

			// Campo de estado atualiza campo cidade
			$(this).find('.field.state select').change(function(){
				var target = $( $(this).data('target') );
				var url = $(this).data('request-url');

				if( target && url && $(this).val() != '' ) {
					$.ajax({
						url: url + $(this).val(),
						dataType: 'json',
						beforeSend: function() {
							target.html('<option value=""></option>').attr('placeholder', 'Carregando...');

							if( $.fn.select2 ) {
								target.select2('val', '');
							}
						},
						success: function(items){
							var cities = '<option value=""></option>';

							$.each(items, function (key_city, val_city) {
								cities += '<option value="' + key_city + '">' + val_city + '</option>';
							});

							target.html(cities).attr('placeholder', 'Cidade');

							if( $.fn.select2 ) {
								target.select2('val', '');
							}
						}
					});
				}
			});

			$(this).on('submit', function( event ) {
				var stopSend = false;
				var form = $(this);
				var $errorContainer;

				if( typeof( settings.errorContainer ) == 'string' ) {
					$errorContainer = $(this).find( settings.errorContainer );
				}
				else {
					$errorContainer = settings.errorContainer;
				}
				
				form.find('input, select, textarea').filter('.' + settings.requiredClass + ':not([disabled])').each(function() {
					if(
						(
							this.tagName == 'INPUT'
							&& (
								this.type == 'text'
								|| this.type == 'password'
								|| this.type == 'date'
							)
							&& this.value == ''
						)
						|| (
							this.tagName == 'INPUT'
							&& this.type == 'file'
							&& (
								this.value == ''
								|| $(this).closest('.field').hasClass( settings.errorClass )
							)
						)
						|| (
							this.tagName == 'INPUT'
							&& (
								this.type == 'text'
								|| this.type == 'email'
							)
							&& $(this).closest('.field').hasClass('email')
							&& (
								this.value == ''
								|| !( /^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/.exec( this.value ) )
							)
						)
						|| (
							this.tagName == 'TEXTAREA'
							&& $(this).val() == ''
						)
						|| (
							this.tagName == 'SELECT'
							&& (
								$(this).val() == ''
								|| ( $(this).val().length && $(this).val().length == 0 )
							)
						)
					) {
						stopSend = true;
						$(this).closest('.field').addClass( settings.errorClass );
					}
					else {
						$(this).closest('.field').removeClass( settings.errorClass );
					}
				});

				// FIXME: integrar com validação acima
				form.find('input[type="file"].' + settings.errorClass).each(function() {
					stopSend = true;
				});

				$errorContainer.find('p').hide();
				if( stopSend ) {
					event.preventDefault();

					form.data('is-valid', false);
					form.find('.messages .invalid').show();
				}
				else {
					form.data('is-valid', true);
					form.find('input[type="submit"]').attr('disabled', 'disabled');
					$errorContainer.find('.sending').show();
				}

				if( form.hasClass('ajaxForm') && stopSend == false ) {
					event.preventDefault();

					$.ajax({
						url: this.action,
						type: this.method || 'POST',
						data: $(this).serialize(),
						dataType: 'json',
						beforeSend: function() {
							$errorContainer.find('.return').removeClass('success error');
						},
						success: function( response ) {
							$errorContainer.find('p').hide();
							if( response ) {
								$errorContainer.find('.return').show().addClass(response.error ? 'error' : 'success').html(response.message);

								if( response.error == false ) {
									form.find('input[type="text"], input[type="password"], input[type="email"], input[type="date"], input[type="file"], select:not(.select2), textarea').val('');
									form.find('input[type="checkbox"], input[type="radio"]').attr('checked', false).parent().removeClass('selected');
									if( $.fn.select2 ) {
										form.find('select[class*="select2"]').select2('val', '', true);
									}

									form.find('.field[data-initial-classes]').each(function() {
										$(this).removeClass().addClass( $(this).data('initial-classes') );
									});
								}
							}
							else {
								$errorContainer.find('.sendError').show().find('span').text('null');
							}

							// Se for definida alguma URL, redireciona
							if( response.url ) {
								window.location.href = response.url;
							}

							// Se tiver alguma callback logo após o AJAX, executa
							if( response.data ) {
								form.trigger('ajax-callback', response.data);
							}
						},
						error: function( x, t, e ) {
							$errorContainer.find('p').hide();
							$errorContainer.find('.sendError').show().find('span').text(t);
						},
						complete: function() {
							form.find('input[type="submit"]').removeAttr('disabled');
						}
					});
				}
			});
		});
	};
})(jQuery);