import * as THREE from 'three';
import Block from "../block/Block";
import BlockId from "../block/BlockId";
import * as  BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils"

export class Chunk {

    blockIdMap: BlockId[] = [];
    chunkX: number;
    chunkZ: number;

    constructor(chunkX: number, chunkZ: number) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
    }

    public getBlock(x: number, y: number, z: number): BlockId {
        let px = x & 15;
        let pz = z & 15;
        let py = y;

        let sp = (py << 8) + (px << 4) + pz

        if (this.blockIdMap[sp]) {
            return this.blockIdMap[sp]
        } else {
            return BlockId.air
        }

    }

    public setBlock(x: number, y: number, z: number, id: BlockId) {
        let px = x & 15;
        let pz = z & 15;
        let py = y;

        let sp = (py << 8) + (px << 4) + pz

        if(id !== BlockId.air){
            this.blockIdMap[sp] = id;
        }
    }

    public render(scene: THREE.Scene) {
        // ジオメトリーのリスト
        let geometries : THREE.BufferGeometry[] = [];

        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 16; x++) {
                for (let z = 0; z < 16; z++) {
                    if (this.getBlock(x, y, z)) {
                        let block = Block.getBlockModelByID(this.getBlock(x, y, z));
                        
                        // if(x % 2 != 0 || z % 2 != 0) continue;

                        block.pushGeometries( geometries,
                            { x: this.chunkX * 16 + x, y: y, z: this.chunkZ * 16 + z },
                            {
                                east : x < 15 ? this.getBlock(x+1,y,z) : BlockId.stone,
                                west : x > 0 ? this.getBlock(x-1,y,z) : BlockId.stone,
                                up   : y < 255 ? this.getBlock(x,y+1,z) : BlockId.stone,
                                down : y > 0 ? this.getBlock(x,y-1,z) : BlockId.stone,
                                south: z < 15 ? this.getBlock(x,y,z+1) : BlockId.stone,
                                north: z > 0 ? this.getBlock(x,y,z-1) : BlockId.stone,
                            });
                    }
                }
            }
        }

        for(let g of geometries){
            g.computeVertexNormals();
        }

        const geometry = BufferGeometryUtils.mergeBufferGeometries( geometries );
        // geometry.computeBoundingSphere();

        const mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( 
            { 
                map: Block.getTexture(),
                side: THREE.DoubleSide,
                alphaTest: 0.5,
                depthTest : true,
                // depthFunc : THREE.LessDepth
                depthFunc : THREE.NeverDepth
                // depthFunc : THREE.AlwaysDepth
                // depthFunc : THREE.LessDepth
                // depthFunc : THREE.LessEqualDepth
                // depthFunc : THREE.EqualDepth
                // depthFunc : THREE.GreaterEqualDepth
                // depthFunc : THREE.GreaterDepth
                // depthFunc : THREE.NotEqualDepth
                
            }));

        // mesh.castShadow = true;
        // mesh.receiveShadow = true;

        scene.add( mesh );

    }

    public generateChunk() {
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 16; x++) {
                for (let z = 0; z < 16; z++) {
                    if (y === 3) {
                        this.setBlock(x, y, z, BlockId.stone);
                    }else {
                        this.setBlock(x, y, z, BlockId.air);
                    }
                }
            }
        }
    }
}