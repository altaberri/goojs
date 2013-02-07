require.config({
    baseUrl : "./",
    paths : {
        goo : "../src/goo",
    }
});
require([//
'goo/entities/GooRunner',//
'goo/math/Vector3',//
'goo/math/Vector4',//
'goo/renderer/pass/NesPass',//
'goo/entities/components/CameraComponent',//
'goo/entities/components/ScriptComponent',//
'goo/renderer/pass/Composer',//
'goo/loaders/JSONImporter',//
'goo/scripts/BasicControlScript',//
'goo/renderer/pass/RenderTarget',//
'goo/renderer/pass/RenderPass',//
'goo/renderer/pass/FullscreenPass',//
'goo/renderer/Util',//
'goo/renderer/Material',//
'goo/renderer/Camera',//
'goo/renderer/shaders/ShaderLib'
], function(//
GooRunner,//
Vector3,//
Vector4,//
NesPass,//
CameraComponent,//
ScriptComponent,//
Composer,//
JSONImporter,//
BasicControlScript,//
RenderTarget,//
RenderPass,//
FullscreenPass,//
Util,//
Material,//
Camera,//
ShaderLib
) {
	"use strict";

	var resourcePath = "../resources";

	function init() {
		var goo = new GooRunner();
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var camera = new Camera(45, 1, 1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.transformComponent.transform.translation.set(0, 15, 75);
		cameraEntity.transformComponent.transform.lookAt(new Vector3(0, 0, 0), Vector3.UNIT_Y);
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.addToWorld();

		var script = {
			zero : new Vector3(),
			run : function(entity) {
				var t = entity._world.time;

				var transform = entity.transformComponent.transform;
				transform.translation.x = Math.sin(t * 1.0) * 10 + 50;
				transform.translation.y = 20;
				transform.translation.z = Math.sin(t * 1.0) * 10 + 50;
				transform.lookAt(this.zero, Vector3.UNIT_Y);
				entity.transformComponent.setUpdated();
			}
		};
		cameraEntity.setComponent(new ScriptComponent(script));

		// Examples of model loading
		loadModels(goo);

		// Disable normal rendering
		goo.world.getSystem('RenderSystem').doRender = false;

		// Create composer with same size as screen
		var composer = new Composer(new RenderTarget(256, 224, {
			magFilter : 'NearestNeighbor'
		}));

		// Scene render
		var renderPass = new RenderPass(goo.world.getSystem('PartitioningSystem').renderList);
		renderPass.clearColor = new Vector4(0.1, 0.1, 0.1, 0.0);

		// NES
		var nesPass = new NesPass(resourcePath + '/nes-lookup.png');

		// Regular copy
		var outPass = new FullscreenPass(Util.clone(ShaderLib.copy));
		outPass.renderToScreen = true;

		composer.addPass(renderPass);
		composer.addPass(nesPass);
		composer.addPass(outPass);

		goo.callbacks.push(function(tpf) {
			composer.render(goo.renderer, tpf);
		});
	}

	function loadModels(goo) {
		var importer = new JSONImporter(goo.world);

		importer.load(resourcePath + '/head.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(40, 40, 40);
				entities[0].transformComponent.transform.translation.y = 15;

				entities[0].setComponent(new ScriptComponent(new BasicControlScript()));
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/girl.model', resourcePath + '/', {
			onSuccess : function(entities) {
				for ( var i in entities) {
					entities[i].addToWorld();
				}
				entities[0].transformComponent.transform.scale.set(0.15, 0.15, 0.15);
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.translation.x = Math.sin(t) * 30;
						transformComponent.transform.translation.z = Math.cos(t) * 30;
						transformComponent.transform.setRotationXYZ(0, Math.sin(t * 1.5) * 3, 0);
						transformComponent.setUpdated();
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
			},
			onError : function(error) {
				console.error(error);
			}
		});

		// Load asynchronous with callback
		importer.load(resourcePath + '/shoes/shoes_compressed.json', resourcePath + '/shoes/textures/', {
			onSuccess : function(entities) {
				// Pull out the fabric entity of the shoe
				var fabricEntity;
				var name = 'polySurfaceShape10[lambert2SG]';
				for ( var key in entities) {
					var entity = entities[key];
					if (entity.name === name) {
						fabricEntity = entity;
						break;
					}
				}
				if (!fabricEntity) {
					console.error('Could not find entity: ' + name);
					return;
				}

				var script = {
					run : function(entity) {
						var t = entity._world.time;

						entity.meshRendererComponent.materials[0].materialState.diffuse.r = Math.sin(t * 3) * 0.5 + 0.5;
						entity.meshRendererComponent.materials[0].materialState.diffuse.g = Math.sin(t * 2) * 0.5 + 0.5;
						entity.meshRendererComponent.materials[0].materialState.diffuse.b = Math.sin(t * 4) * 0.5 + 0.5;
					}
				};
				fabricEntity.setComponent(new ScriptComponent(script));

				for ( var i in entities) {
					entities[i].addToWorld();
				}
				// entities[0].transformComponent.transform.scale.set(1.5, 1.5, 1.5);
				entities[0].transformComponent.transform.translation.y = -5;
				var script = {
					run : function(entity) {
						var t = entity._world.time;

						var transformComponent = entity.transformComponent;
						transformComponent.transform.setRotationXYZ(0, t * 0.5, 0);
						transformComponent.setUpdated();
					}
				};
				entities[0].setComponent(new ScriptComponent(script));
			},
			onError : function(error) {
				console.error(error);
			}
		});

	}

	init();
});
