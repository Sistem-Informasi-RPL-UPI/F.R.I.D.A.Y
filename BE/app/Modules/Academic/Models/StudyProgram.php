<?php

namespace App\Modules\Academic\Models;

use Illuminate\Database\Eloquent\Model;

class StudyProgram extends Model
{
    protected $fillable = ['code', 'name', 'degree', 'color_hex'];
}
